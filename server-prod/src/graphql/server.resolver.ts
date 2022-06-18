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
import {
  getCronQueueKey,
  getJobQueueKey,
  getJobQueueNamesKey,
  getJobQueuePathKey,
} from "src/utils";

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
              {
                accessToken: this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
                data: job.data.data,
              },
            ),
          );
        },
        {
          concurrency: this.environmentVariables.NEXT_JOBS_CONCURRENCY_LIMIT,
          connection: this.ioRedis,
          limiter: {
            max: this.environmentVariables.NEXT_JOBS_CONCURRENCY_LIMIT,
            duration: this.environmentVariables.NEXT_JOBS_MAX_JOB_DURATION,
          },
        },
      ),
    );
    this.workers.set(
      cronQueueKey,
      new Worker(
        cronQueueKey,
        async (job: Job<{ path: string }>) => {
          this.logger.debug(`Processing scheduled job: ${JSON.stringify(job)}`);
          await lastValueFrom(
            this.httpService.post(
              `${this.environmentVariables.NEXT_JOBS_BASE_URL}/${job.data.path}`,
              {
                accessToken: this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
              },
            ),
          );
        },
        {
          concurrency: this.environmentVariables.NEXT_JOBS_CONCURRENCY_LIMIT,
          connection: this.ioRedis,
          limiter: {
            max: this.environmentVariables.NEXT_JOBS_CONCURRENCY_LIMIT,
            duration: this.environmentVariables.NEXT_JOBS_MAX_JOB_DURATION,
          },
        },
      ),
    );
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
    if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
      return Result.INVALID_TOKEN;
    }
    // We store all queue names in a redis set, and store a key-value pair
    // for each queue name, mapping queue name to queue path
    const jobQueueNamesKey = getJobQueueNamesKey(
      this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
    );
    const existingQueues = await this.ioRedis.smembers(jobQueueNamesKey);
    for (const queue of existingQueues) {
      await this.ioRedis.del(
        getJobQueuePathKey(
          this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
          queue,
        ),
      );
      await this.ioRedis.srem(jobQueueNamesKey, queue);
    }
    for (const queue of queues) {
      this.logger.debug(`Adding queue: ${JSON.stringify(queue)}`);
      await this.ioRedis.sadd(jobQueueNamesKey, queue.name);
      await this.ioRedis.set(
        getJobQueuePathKey(
          this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
          queue.name,
        ),
        queue.path,
      );
    }
    return Result.SUCCESS;
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
      const repeatableJobs = await scheduledJobsQueue.getRepeatableJobs();
      this.logger.debug(`repeatable jobs: ${repeatableJobs}`);
    }
    return Result.SUCCESS;
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
    if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
      return Result.INVALID_TOKEN;
    }
    const path = await this.ioRedis.get(
      getJobQueuePathKey(
        this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
        queueName,
      ),
    );
    this.logger.debug(`Path for queue name: ${queueName}, path: ${path}`);
    if (!path) {
      return Result.QUEUE_NOT_FOUND;
    }
    const jobQueueKey = getJobQueueKey(
      this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
    );
    await new Queue(jobQueueKey, { connection: this.ioRedis }).add(queueName, {
      data,
      path,
    });
    return Result.SUCCESS;
  }
}
