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
import { PaypalSubscriptionStatus } from "@dwayneyuen/next-cron-prisma";
import { EnvironmentVariables } from "src/environment-variables";
import { CRON_JOBS_QUEUE, getCronQueueKey, getJobQueueKey } from "src/utils";
import { CronJobService } from "src/prisma/cron-job.service";
import { UserService } from "src/prisma/user.service";
import { MessageQueueService } from "src/prisma/message-queue.service";

export enum Result {
  SUCCESS = "SUCCESS",
  INACTIVE_SUBSCRIPTION = "INACTIVE_SUBSCRIPTION",
  INVALID_TOKEN = "INVALID_TOKEN",
  QUEUE_NOT_FOUND = "QUEUE_NOT_FOUND",
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
class CreateCronJobDto {
  @Field()
  path: string;
  @Field()
  schedule: string;
}

/**
 * Catch-all resolver for the managed implementation of the next-jobs server
 */
@Resolver()
export class ServerResolver {
  constructor(
    private cronJobService: CronJobService,
    private environmentVariables: EnvironmentVariables,
    private httpService: HttpService,
    private messageQueueService: MessageQueueService,
    private ioRedis: IORedis,
    private userService: UserService,
  ) {
    const jobQueueKey = getJobQueueKey();
    const cronQueueKey = getCronQueueKey();
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
        async (job: Job<{ data: string; path: string; userId: string }>) => {
          this.logger.debug(
            `Processing queue job: ${job.queueName}, data: ${JSON.stringify(
              job.data,
            )}`,
          );
          // await lastValueFrom(
          //   this.httpService.post(
          //     `${this.environmentVariables.NEXT_JOBS_BASE_URL}/${job.data.path}`,
          //     {
          //       accessToken: this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
          //       data: job.data.data,
          //     },
          //   ),
          // );
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
          // await lastValueFrom(
          //   this.httpService.post(
          //     `${this.environmentVariables.NEXT_JOBS_BASE_URL}/${job.data.path}`,
          //     {
          //       accessToken: this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
          //     },
          //   ),
          // );
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
  async createMessageQueues(
    @Args("accessToken") accessToken: string,
    @Args({ name: "queues", type: () => [CreateQueueDto] })
    queues: CreateQueueDto[],
  ): Promise<Result> {
    const user = await this.userService.findUnique({ accessToken });
    if (!user) {
      return Result.INVALID_TOKEN;
    }
    if (user.paypalSubscriptionStatus !== PaypalSubscriptionStatus.ACTIVE) {
      return Result.INACTIVE_SUBSCRIPTION;
    }
    await this.messageQueueService.deleteMany({ userId: user.id });
    await this.messageQueueService.createMany(
      queues.map((queue) => ({
        name: queue.name,
        path: queue.path,
        userId: user.id,
      })),
    );
    return Result.SUCCESS;
  }

  /**
   * Register scheduled jobs
   *
   * @param accessToken
   * @param jobs
   */
  @Mutation(() => Result)
  async createCronJobs(
    // TODO: Add guard for access token authentication
    @Args("accessToken") accessToken: string,
    @Args({ name: "jobs", type: () => [CreateCronJobDto] })
    jobs: CreateCronJobDto[],
  ): Promise<Result> {
    const user = await this.userService.findUnique({ accessToken });
    if (!user) {
      return Result.INVALID_TOKEN;
    }
    if (user.paypalSubscriptionStatus !== PaypalSubscriptionStatus.ACTIVE) {
      return Result.INACTIVE_SUBSCRIPTION;
    }
    const cronJobsQueue = new Queue(CRON_JOBS_QUEUE, {
      connection: this.ioRedis,
    });
    const cronJobs = await this.cronJobService.findMany({
      where: { userId: user.id },
    });
    for (const cronJob of cronJobs) {
      await cronJobsQueue.remove(cronJob.jobId);
    }
    await this.cronJobService.deleteMany({
      userId: user.id,
    });
    for (const job of jobs) {
      const cronJob = await cronJobsQueue.add(
        `${user.id}-${job.path}`,
        { path: job.path, userId: user.id },
        { repeat: { cron: job.schedule } },
      );
      await this.cronJobService.create({
        jobId: cronJob.id,
        path: job.path,
        userId: user.id,
      });
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
    @Args("accessToken") _accessToken: string,
    @Args("queueName") _queueName: string,
    @Args("data") _data: string,
  ): Promise<Result> {
    // this.logger.debug(
    //   `accessToken: ${accessToken}, queueName: ${queueName}, data: ${data}, accessToken: ${this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN}`,
    // );
    // if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
    //   return Result.INVALID_TOKEN;
    // }
    // const path = await this.ioRedis.get(
    //   getJobQueuePathKey(
    //     this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
    //     queueName,
    //   ),
    // );
    // this.logger.debug(`Path for queue name: ${queueName}, path: ${path}`);
    // if (!path) {
    //   return Result.QUEUE_NOT_FOUND;
    // }
    // const jobQueueKey = getJobQueueKey(
    //   this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN,
    // );
    // await new Queue(jobQueueKey, { connection: this.ioRedis }).add(queueName, {
    //   data,
    //   path,
    // });
    return Result.SUCCESS;
  }
}
