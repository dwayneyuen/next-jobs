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
import { Queue } from "bull";
import { EnvironmentVariables } from "src/environment-variables";
import { InjectQueue } from "@nestjs/bull";

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
    @InjectQueue("jobs") private jobsQueue: Queue,
    @InjectQueue("queues") private queuesQueue: Queue,
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
    this.logger.debug(`accessToken: ${accessToken}, queues: ${queues}`);
    if (this.environmentVariables.NEXT_JOBS_SELF_HOSTED) {
      if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
        return Result.INVALID_TOKEN;
      }
      const existingQueues = await this.ioRedis.smembers(QUEUES);
      for (const queue of existingQueues) {
        this.logger.debug(`Removing queue: ${queue}`);
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
      const existingScheduledJobs = await this.ioRedis.smembers(JOBS);
      for (const jobName of existingScheduledJobs) {
        this.logger.debug(`Removing scheduled job: ${jobName}`);
        const jobId = await this.ioRedis.get(`${jobName}-id`);
        const existingJob = await this.jobsQueue.getJob(jobId);
        if (existingJob) {
          await existingJob.remove();
        }
        await this.ioRedis.del(`${jobName}-path`);
        await this.ioRedis.del(`${jobName}-id`);
        await this.ioRedis.srem(JOBS, jobName);
      }
      for (const job of jobs) {
        this.logger.debug(`Adding scheduled job: ${JSON.stringify(job)}`);
        await this.ioRedis.sadd(JOBS, job.name);
        await this.ioRedis.set(`${job.name}-path`, job.path);
        const addedJob = await this.jobsQueue.add(
          { data: "data" },
          { repeat: { cron: "* * * * *" } },
        );
        // We can't completely control the jobId with a repeat, so we have to
        // store the one we get back
        await this.ioRedis.set(`${job.name}-id`, addedJob.id);
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
