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

export enum Result {
  SUCCESS,
  INVALID_TOKEN,
  NOT_IMPLEMENTED,
}

registerEnumType(Result, {
  name: "Result",
});

export const JOBS = "jobs";
export const QUEUES = "queues";
export const WORKERS = "workers";

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

const getKeys = (map: Map<any, any>) => {
  const result = [];
  for (const key of map.keys()) {
    result.push(key);
  }
  return result;
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
    // TODO: Populate workers array on startup
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
        async (job: Job) => {
          this.logger.debug(`Processing queue job: ${JSON.stringify(job)}`);
        },
        { connection: this.ioRedis },
      ),
    );
    this.workers.set(
      JOBS,
      new Worker(
        JOBS,
        async (job: Job) => {
          this.logger.debug(`Processing scheduled job: ${JSON.stringify(job)}`);
        },
        { connection: this.ioRedis },
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
    if (this.environmentVariables.NEXT_JOBS_SELF_HOSTED) {
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
    if (this.environmentVariables.NEXT_JOBS_SELF_HOSTED) {
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
   */
  // @Mutation(() => Result)
  // async enqueueJob(
  //   @Args("accessToken") accessToken: string,
  //   @Args("queueName") queueName: string,
  //   @Args("data") data: string,
  // ): Promise<Result> {
  //   if (this.environmentVariables.NEXT_JOBS_SELF_HOSTED) {
  //     if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
  //       return Result.INVALID_TOKEN;
  //     }
  //     new Queue(queueName).add({ data });
  //     // await this.queue.add({ data });
  //   }
  //   return Result.SUCCESS;
  // }
}
