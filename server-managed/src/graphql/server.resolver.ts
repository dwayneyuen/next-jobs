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
import {
  JobResultJobType,
  JobResultStatus,
  PaypalSubscriptionStatus,
} from "@dwayneyuen/next-cron-prisma";
import { lastValueFrom } from "rxjs";
import { differenceInMilliseconds } from "date-fns";
import { AxiosError } from "axios";
import { EnvironmentVariables } from "src/environment-variables";
import { UserService } from "src/prisma/user.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CRON_JOBS_QUEUE, MESSAGE_QUEUE } from "src/constants";

export enum Result {
  SUCCESS = "SUCCESS",
  INACTIVE_SUBSCRIPTION = "INACTIVE_SUBSCRIPTION",
  INVALID_TOKEN = "INVALID_TOKEN",
}

export enum CreateCronJobResult {
  SUCCESS = "SUCCESS",
  INVALID_CRON_EXPRESSION = "INVALID_CRON_EXPRESSION",
  INACTIVE_SUBSCRIPTION = "INACTIVE_SUBSCRIPTION",
  INVALID_TOKEN = "INVALID_TOKEN",
}

export enum EnqueueMessageResult {
  SUCCESS = "SUCCESS",
  INACTIVE_SUBSCRIPTION = "INACTIVE_SUBSCRIPTION",
  INVALID_TOKEN = "INVALID_TOKEN",
  NO_JOBS_REMAINING = "NO_JOBS_REMAINING",
  QUEUE_NOT_FOUND = "QUEUE_NOT_FOUND",
}

registerEnumType(CreateCronJobResult, {
  name: "CreateCronJobResult",
});

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

type CronJobDataType = {
  path: string;
  userId: string;
};

type MessageQueueDataType = {
  data: string;
  path: string;
  userId: string;
};

type WorkerJobResult = {
  duration: number;
  status: number;
};

/**
 * Catch-all resolver for the managed implementation of the next-jobs server
 */
@Resolver()
export class ServerResolver {
  private readonly cronJobQueue: Queue;
  private readonly cronJobQueueScheduler: QueueScheduler;
  private readonly cronJobWorker: Worker;
  private readonly logger = new Logger(ServerResolver.name);
  private readonly messageQueue: Queue;
  private readonly messageQueueScheduler: QueueScheduler;
  private readonly messageQueueWorker: Worker;

  constructor(
    private environmentVariables: EnvironmentVariables,
    private httpService: HttpService,
    private prismaService: PrismaService,
    private ioRedis: IORedis,
    private userService: UserService,
  ) {
    this.cronJobQueue = new Queue(CRON_JOBS_QUEUE, {
      connection: this.ioRedis,
    });
    this.messageQueue = new Queue(MESSAGE_QUEUE, { connection: this.ioRedis });
    this.cronJobQueueScheduler = new QueueScheduler(CRON_JOBS_QUEUE, {
      connection: this.ioRedis,
    });
    this.messageQueueScheduler = new QueueScheduler(MESSAGE_QUEUE, {
      connection: this.ioRedis,
    });
    this.cronJobWorker = new Worker(
      CRON_JOBS_QUEUE,
      async (job: Job<CronJobDataType>): Promise<WorkerJobResult> => {
        this.logger.debug(`Processing job: ${JSON.stringify(job)}`);
        const user = await this.prismaService.user.findUnique({
          where: { id: job.data.userId },
        });
        if (!user) {
          throw new Error("User not found");
        }
        if (user.jobsRemaining <= 0) {
          throw new Error("No jobs remaining");
        }
        // TODO: Optimistic locking of some kind. Prisma doesn't support it
        // natively. May need to execute a raw query.
        await this.prismaService.user.update({
          where: { id: job.data.userId },
          data: { jobsRemaining: user.jobsRemaining - 1 },
        });
        const start = new Date();
        let result;
        try {
          result = await lastValueFrom(
            this.httpService.post(`${user.baseUrl}/${job.data.path}`, {
              accessToken: user.accessToken,
            }),
          );
        } catch (e) {
          this.logger.error(`cronJobWorker error: ${JSON.stringify(e)}`);
          throw e;
        }
        const end = new Date();

        return {
          duration: differenceInMilliseconds(end, start),
          status: result.status,
        };
      },
      {
        concurrency: this.environmentVariables.NEXT_CRON_CONCURRENCY_LIMIT,
        connection: this.ioRedis,
      },
    );
    this.messageQueueWorker = new Worker(
      MESSAGE_QUEUE,
      async (job: Job<MessageQueueDataType>): Promise<WorkerJobResult> => {
        this.logger.debug(
          `Processing message queue job: ${
            job.queueName
          }, data: ${JSON.stringify(job.data)}`,
        );
        const user = await this.prismaService.user.findUnique({
          where: { id: job.data.userId },
        });
        if (!user) {
          throw new Error("User not found");
        }
        if (user.jobsRemaining <= 0) {
          throw new Error("No jobs remaining");
        }
        // TODO: Optimistic locking of some kind. Prisma doesn't support it
        // natively. May need to execute a raw query.
        await this.prismaService.user.update({
          where: { id: job.data.userId },
          data: { jobsRemaining: user.jobsRemaining - 1 },
        });
        const start = new Date();
        let result;
        try {
          result = await lastValueFrom(
            this.httpService.post(`${user.baseUrl}/${job.data.path}`, {
              accessToken: user.accessToken,
              data: job.data.data,
            }),
          );
        } catch (e) {
          this.logger.error(`messageQueueWorker error: ${JSON.stringify(e)}`);
          throw e;
        }
        const end = new Date();

        return {
          duration: differenceInMilliseconds(end, start),
          status: result.status,
        };
      },
      {
        concurrency: this.environmentVariables.NEXT_CRON_CONCURRENCY_LIMIT,
        connection: this.ioRedis,
      },
    );

    this.cronJobWorker.on(
      "completed",
      async (job: Job<CronJobDataType>, returnValue: WorkerJobResult) => {
        const status =
          returnValue.status === 200
            ? JobResultStatus.SUCCESS
            : JobResultStatus.FAILURE;
        await this.prismaService.jobResult.create({
          data: {
            duration: returnValue.duration,
            httpStatus: returnValue.status,
            jobResultStatus: status,
            jobType: JobResultJobType.CRON_JOB,
            path: job.data.path,
            userId: job.data.userId,
          },
        });
      },
    );
    this.cronJobWorker.on(
      "failed",
      async (job: Job<CronJobDataType>, error: Error) => {
        let httpStatus;
        if (error instanceof AxiosError) {
          httpStatus = error.status;
        }
        await this.prismaService.jobResult.create({
          data: {
            duration: null,
            httpStatus,
            jobResultStatus: JobResultStatus.FAILURE,
            jobType: JobResultJobType.CRON_JOB,
            path: job.data.path,
            userId: job.data.userId,
          },
        });
      },
    );
    this.cronJobWorker.on("error", (error: Error) => {
      this.logger.error(`Error in cronJobWorker: ${error}`);
    });
    this.messageQueueWorker.on(
      "completed",
      async (job: Job<MessageQueueDataType>, returnValue: WorkerJobResult) => {
        const status =
          returnValue.status === 200
            ? JobResultStatus.SUCCESS
            : JobResultStatus.FAILURE;
        await this.prismaService.jobResult.create({
          data: {
            duration: returnValue.duration,
            httpStatus: returnValue.status,
            jobResultStatus: status,
            jobType: JobResultJobType.MESSAGE_QUEUE,
            path: job.data.path,
            userId: job.data.userId,
          },
        });
      },
    );
    this.messageQueueWorker.on(
      "failed",
      async (job: Job<CronJobDataType>, error: Error) => {
        let httpStatus;
        if (error instanceof AxiosError) {
          httpStatus = error.status;
        }
        await this.prismaService.jobResult.create({
          data: {
            duration: null,
            httpStatus,
            jobResultStatus: JobResultStatus.FAILURE,
            jobType: JobResultJobType.MESSAGE_QUEUE,
            path: job.data.path,
            userId: job.data.userId,
          },
        });
      },
    );
    this.messageQueueWorker.on("error", (error: Error) => {
      this.logger.error(`Error in cronJobWorker: ${error}`);
    });
  }

  /**
   * Query must be defined to be a valid graphql resolver
   */
  @Query(() => String)
  async jobs(): Promise<string> {
    const jobCounts = await this.cronJobQueue.getJobCounts();
    const repeatableJobs = await this.cronJobQueue.getRepeatableJobs();
    this.logger.log(`job counts: ${JSON.stringify(jobCounts)}`);
    this.logger.log(`repeatable jobs: ${JSON.stringify(repeatableJobs)}`);
    return "foo";
  }

  @Mutation(() => Boolean)
  async obliterate(): Promise<boolean> {
    await this.cronJobQueue.obliterate();
    await this.messageQueue.obliterate();
    return true;
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
    await this.prismaService.messageQueue.deleteMany({
      where: { userId: user.id },
    });
    await this.prismaService.messageQueue.createMany({
      data: queues.map((queue) => ({
        name: queue.name,
        path: queue.path,
        userId: user.id,
      })),
    });
    return Result.SUCCESS;
  }

  /**
   * Register scheduled jobs
   *
   * @param accessToken
   * @param jobs
   */
  @Mutation(() => CreateCronJobResult)
  async createCronJobs(
    @Args("accessToken") accessToken: string,
    @Args({ name: "jobs", type: () => [CreateCronJobDto] })
    jobs: CreateCronJobDto[],
  ): Promise<CreateCronJobResult> {
    const user = await this.userService.findUnique({ accessToken });
    if (!user) {
      return CreateCronJobResult.INVALID_TOKEN;
    }
    if (user.paypalSubscriptionStatus !== PaypalSubscriptionStatus.ACTIVE) {
      return CreateCronJobResult.INACTIVE_SUBSCRIPTION;
    }
    const cronJobs = await this.prismaService.cronJob.findMany({
      where: { userId: user.id },
    });
    for (const cronJob of cronJobs) {
      await this.cronJobQueue.remove(cronJob.jobId);
    }
    await this.prismaService.cronJob.deleteMany({
      where: {
        userId: user.id,
      },
    });
    for (const job of jobs) {
      try {
        const cronJob = await this.cronJobQueue.add(
          `${user.id}-${job.path}`,
          {
            baseUrl: user.baseUrl,
            path: job.path,
            userId: user.id,
          },
          { repeat: { cron: job.schedule } },
        );

        await this.prismaService.cronJob.create({
          data: {
            jobId: cronJob.id,
            path: job.path,
            userId: user.id,
          },
        });
      } catch (e) {
        this.logger.error(`Caught error creating cron job: ${e}`);
      }
    }

    return CreateCronJobResult.SUCCESS;
  }

  /**
   * Place a message onto a message queue
   *
   * @param accessToken
   * @param queueName
   * @param data A JSON.stringified form of the data to be enqueued
   */
  @Mutation(() => Result)
  async enqueueMessage(
    @Args("accessToken") accessToken: string,
    @Args("queueName") queueName: string,
    @Args("data") data: string,
  ): Promise<EnqueueMessageResult> {
    this.logger.debug(`[enqueueMessage] start: ${queueName}, ${data}`);
    const user = await this.prismaService.user.findUnique({
      where: { accessToken },
    });
    if (!user) {
      return EnqueueMessageResult.INVALID_TOKEN;
    }
    if (user.paypalSubscriptionStatus !== PaypalSubscriptionStatus.ACTIVE) {
      return EnqueueMessageResult.INACTIVE_SUBSCRIPTION;
    }
    if (user.jobsRemaining <= 0) {
      return EnqueueMessageResult.NO_JOBS_REMAINING;
    }
    const messageQueue = await this.prismaService.messageQueue.findUnique({
      where: {
        name_userId: {
          name: queueName,
          userId: user.id,
        },
      },
    });
    if (!messageQueue) {
      return EnqueueMessageResult.QUEUE_NOT_FOUND;
    }
    await this.messageQueue.add(`${user.id}-${messageQueue.path}`, {
      baseUrl: user.baseUrl,
      data,
      path: messageQueue.path,
      userId: user.id,
    });

    return EnqueueMessageResult.SUCCESS;
  }
}
