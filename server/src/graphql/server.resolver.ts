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
import { EnvironmentVariables } from "src/environment-variables";
import { JOBS, QUEUES } from "src/constants";
import { lastValueFrom } from "rxjs";

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
    this.logger.log("Initializing schedulers");
    this.queueSchedulers.set(
      QUEUES,
      new QueueScheduler(QUEUES, { connection: this.ioRedis }),
    );
    this.queueSchedulers.set(
      JOBS,
      new QueueScheduler(JOBS, { connection: this.ioRedis }),
    );
    this.workers.set(
      QUEUES,
      new Worker(
        QUEUES,
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
        { concurrency: 100, connection: this.ioRedis },
      ),
    );
    this.workers.set(
      JOBS,
      new Worker(
        JOBS,
        async (job: Job<{ path: string }>) => {
          this.logger.debug(`Processing scheduled job: ${JSON.stringify(job)}`);
          await lastValueFrom(
            this.httpService.post(
              `${this.environmentVariables.NEXT_JOBS_BASE_URL}/${job.data.path}`,
            ),
          );
        },

        { concurrency: 100, connection: this.ioRedis },
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
  async createQueues(
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
      const existingQueues = await this.ioRedis.smembers(QUEUES);
      for (const queue of existingQueues) {
        await this.ioRedis.del(queue);
        await this.ioRedis.srem(QUEUES, queue);
      }
      for (const queue of queues) {
        this.logger.debug(`Adding queue: ${JSON.stringify(queue)}`);
        await this.ioRedis.sadd(QUEUES, queue.name);
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
      const scheduledJobsQueue = new Queue(JOBS, { connection: this.ioRedis });
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
      await new Queue(QUEUES, { connection: this.ioRedis }).add(queueName, {
        data,
        path,
      });
      return Result.SUCCESS;
    }
    return Result.NOT_IMPLEMENTED;
  }
}
