import {
  Args,
  Field,
  InputType,
  Mutation,
  Query,
  registerEnumType,
  Resolver,
} from "@nestjs/graphql";
import { Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import IORedis from "ioredis";
import { Job, Queue, QueueScheduler, Worker } from "bullmq";
import { lastValueFrom } from "rxjs";
import { EnvironmentVariables } from "src/environment-variables";
import { JOBS, QUEUES } from "src/constants";

export enum Result {
  SUCCESS,
  INVALID_TOKEN,
  NOT_IMPLEMENTED,
  QUEUE_NOT_FOUND,
}

registerEnumType(Result, {
  name: "Result",
});

@InputType()
class CreateQueueDto {
  @Field()
  name: string;
  @Field()
  path: string;
}

@InputType()
class CreateScheduledJobDto {
  @Field()
  name: string;
  @Field()
  path: string;
  @Field()
  schedule: string;
}

const getJobQueueKey = (accessToken: string): string => {
  return `${QUEUES}-${accessToken}`;
};

const getCronQueueKey = (accessToken: string): string => {
  return `${JOBS}-${accessToken}`;
};

/**
 * Catch-all resolver for the next-jobs server
 */
@Resolver()
export class ServerResolver {
  constructor(
    private environmentVariables: EnvironmentVariables,
    private httpService: HttpService,
    private ioRedis: IORedis,
  ) {
    if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN) {
      const jobQueueKey = getJobQueueKey(
        this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
      );
      const cronQueueKey = getCronQueueKey(
        this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
      );
      this.queueSchedulers.set(
        jobQueueKey,
        new QueueScheduler(jobQueueKey, { connection: this.ioRedis }),
      );
      this.queueSchedulers.set(
        cronQueueKey,
        new QueueScheduler(cronQueueKey, { connection: this.ioRedis }),
      );
      this.workers.set(
        jobQueueKey,
        new Worker(
          jobQueueKey,
          async (job: Job<{ data: string; path: string }>) => {
            this.logger.debug(
              `Processing queue job: ${job.queueName}, data: ${JSON.stringify(
                job.data,
              )}`,
            );
            await lastValueFrom(
              this.httpService.post(
                `${this.environmentVariables.NEXT_JOBS_BASE_URL}/${job.data.path}`,
                { data: job.data.data },
              ),
            );
          },
          {
            concurrency: 10,
            connection: this.ioRedis,
            limiter: { max: 10, duration: 30000 },
          },
        ),
      );
      this.workers.set(
        cronQueueKey,
        new Worker(
          cronQueueKey,
          async (job: Job<{ path: string }>) => {
            this.logger.debug(
              `Processing scheduled job: ${JSON.stringify(job)}`,
            );
            await lastValueFrom(
              this.httpService.post(
                `${this.environmentVariables.NEXT_JOBS_BASE_URL}/${job.data.path}`,
              ),
            );
          },
          {
            concurrency: 10,
            connection: this.ioRedis,
            limiter: { max: 10, duration: 30000 },
          },
        ),
      );
    }
  }

  private readonly logger = new Logger(ServerResolver.name);
  private readonly workers: Map<string, Worker> = new Map();
  private readonly queueSchedulers: Map<string, QueueScheduler> = new Map();

  /**
   * Query must be defined to be a valid graphql resolver
   */
  @Query(() => String)
  async foo(): Promise<string> {
    return "foo";
  }

  /**
   * Save a mapping for each queue name to the path to call back to
   *
   * @param accessToken
   * @param queues
   */
  @Mutation(() => Result)
  async createJobQueues(
    @Args("accessToken") accessToken: string,
    @Args({ name: "queues", type: () => [CreateQueueDto] })
    queues: CreateQueueDto[],
  ): Promise<Result> {
    this.logger.debug(
      `accessToken: ${accessToken}, queues: ${JSON.stringify(queues)}`,
    );
    if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN) {
      if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
        return Result.INVALID_TOKEN;
      }
      // We store all queue names in a redis set, and store a key-value pair
      // for each queue name, mapping queue name to queue path
      const jobQueueKey = getJobQueueKey(
        this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
      );
      const existingQueues = await this.ioRedis.smembers(jobQueueKey);
      for (const queue of existingQueues) {
        await this.ioRedis.del(queue);
        await this.ioRedis.srem(jobQueueKey, queue);
      }
      for (const queue of queues) {
        this.logger.debug(`Adding queue: ${JSON.stringify(queue)}`);
        await this.ioRedis.sadd(jobQueueKey, queue.name);
        await this.ioRedis.set(queue.name, queue.path);
      }
      return Result.SUCCESS;
    }
  }

  /**
   * Register scheduled jobs
   *
   * @param accessToken
   * @param jobs
   */
  @Mutation(() => Result)
  async createScheduledJobs(
    // TODO: Add guard for access token authentication
    @Args("accessToken") accessToken: string,
    @Args({ name: "jobs", type: () => [CreateScheduledJobDto] })
    jobs: CreateScheduledJobDto[],
  ): Promise<Result> {
    this.logger.debug(
      `accessToken: ${accessToken}, jobs: ${JSON.stringify(jobs)}`,
    );
    if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN) {
      if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
        return Result.INVALID_TOKEN;
      }
      const cronQueueKey = getCronQueueKey(
        this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
      );
      const scheduledJobsQueue = new Queue(cronQueueKey, {
        connection: this.ioRedis,
      });
      const repeatableJobs = await scheduledJobsQueue.getRepeatableJobs();
      for (const repeatableJob of repeatableJobs) {
        await scheduledJobsQueue.removeRepeatableByKey(repeatableJob.key);
      }
      for (const job of jobs) {
        this.logger.debug(`Adding scheduled job: ${JSON.stringify(job)}`);
        await scheduledJobsQueue.add(
          job.name,
          { path: job.path },
          { repeat: { cron: job.schedule } },
        );
      }
      return Result.SUCCESS;
    }
    return Result.NOT_IMPLEMENTED;
  }

  /**
   * Place a job onto a queue
   *
   * TODO: delays
   */
  @Mutation(() => Result)
  async enqueueJob(
    @Args("accessToken") accessToken: string,
    @Args("queueName") queueName: string,
    @Args("data") data: string,
  ): Promise<Result> {
    this.logger.debug(
      `accessToken: ${accessToken}, queueName: ${queueName}, data: ${data}, accessToken: ${this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN}`,
    );
    if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN) {
      if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
        return Result.INVALID_TOKEN;
      }
      const path = await this.ioRedis.get(queueName);
      this.logger.debug(
        `Looking up path for queue name: ${queueName}, path: ${path}`,
      );
      if (!path) {
        return Result.QUEUE_NOT_FOUND;
      }
      const jobQueueKey = getJobQueueKey(
        this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
      );
      await new Queue(jobQueueKey, { connection: this.ioRedis }).add(
        queueName,
        {
          data,
          path,
        },
      );
      return Result.SUCCESS;
    }
    return Result.NOT_IMPLEMENTED;
  }
}
