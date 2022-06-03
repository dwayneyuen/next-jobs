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
import { Queue, QueueScheduler } from "bullmq";
import { EnvironmentVariables } from "src/environment-variables";
import { QueueSchedulerService } from "src/queue-scheduler.service";

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
    // TODO: Add eslint rule to allow underscore unused
    private _queueSchedulerService: QueueSchedulerService,
  ) {}

  private readonly logger = new Logger(ServerResolver.name);

  /**
   * Query must be defined to be a valid graphql resolver
   */
  @Query(() => String)
  async foo(): Promise<string> {
    return "foo";
  }

  /**
   * Obliterate old queue paths and store new queue paths
   *
   * Queues are stored as <queue_name>$<path_to_callback>
   *
   * TODO: Throw an error if any queues have a duplicate name or path
   * TODO: Find a way to do this without obliterating so that we can preserve
   * metrics
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
    this.logger.debug(`accessToken: ${accessToken}, queues: ${queues}`);
    if (this.environmentVariables.NEXT_JOBS_SELF_HOSTED) {
      if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
        return Result.INVALID_TOKEN;
      }
      await new Queue(QUEUES, { connection: this.ioRedis }).obliterate();
      const existingQueues = await this.ioRedis.smembers(QUEUES);
      for (const queue of existingQueues) {
        this.logger.debug(`Remove queue: ${JSON.stringyify(queue)}`);
        await this.ioRedis.del(queue);
        await this.ioRedis.srem(QUEUES, queue);
      }
      for (const queue of queues) {
        this.logger.debug(`Adding queue: ${queue}`);
        await this.ioRedis.set(queue.name, queue.path);
        await this.ioRedis.sadd(QUEUES, queue.name);
      }
      return Result.SUCCESS;
    }
  }

  /**
   * Obliterate old scheduled jobs and create new scheduled jobs
   *
   * For self-hosting, define the environment variable NEXT_JOBS_ACCESS_TOKEN.
   * Otherwise, this will call out to another API server to validate the
   * access token.
   *
   * TODO: Find a way to do this without obliterating so that we can preserve
   * metrics
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
    this.logger.debug(`accessToken: ${accessToken}, jobs: ${jobs}`);
    // Self-hosted
    if (this.environmentVariables.NEXT_JOBS_SELF_HOSTED) {
      if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
        return Result.INVALID_TOKEN;
      }
      const jobsQueue = await new Queue(JOBS, { connection: this.ioRedis });
      await jobsQueue.drain();
      for (const job of jobs) {
        this.logger.debug(`Adding scheduled job: ${JSON.stringify(job)}`);
        await jobsQueue.add(
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
