import { Test } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { PaypalSubscriptionStatus } from "@dwayneyuen/next-cron-prisma";
import { faker } from "@faker-js/faker";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import {
  EnqueueMessageResult,
  Result,
  ServerResolver,
} from "src/graphql/server.resolver";
import { EnvironmentVariables } from "src/environment-variables";
import { HttpServiceFake } from "src/http-service.fake";
import { UserFactory } from "test/factories/user.factory";
import { CronJobService } from "src/prisma/cron-job.service";
import { RedisModule } from "src/redis.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { CronJobFactory } from "test/factories/cron-job.factory";
import { CRON_JOBS_QUEUE, MESSAGE_QUEUE_QUEUE } from "src/utils";
import { MessageQueueFactory } from "test/factories/message-queue.factory";
import { MessageQueueService } from "src/prisma/message-queue.service";
import { PrismaService } from "src/prisma/prisma.service";

describe("ResolverModule", () => {
  let cronJobFactory: CronJobFactory;
  let cronJobQueue: Queue;
  let cronJobService: CronJobService;
  let messageQueueQueue: Queue;
  let messageQueueFactory: MessageQueueFactory;
  let messageQueueService: MessageQueueService;
  let prismaService: PrismaService;
  let serverResolver: ServerResolver;
  let userFactory: UserFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, RedisModule],
      providers: [
        {
          provide: EnvironmentVariables,
          useValue: new EnvironmentVariables(),
        },
        {
          provide: HttpService,
          useValue: new HttpServiceFake(),
        },
        CronJobFactory,
        MessageQueueFactory,
        ServerResolver,
        UserFactory,
      ],
    }).compile();

    cronJobFactory = moduleRef.get(CronJobFactory);
    cronJobQueue = new Queue(CRON_JOBS_QUEUE, {
      connection: moduleRef.get(IORedis),
    });
    cronJobService = moduleRef.get(CronJobService);
    messageQueueFactory = moduleRef.get(MessageQueueFactory);
    messageQueueQueue = new Queue(MESSAGE_QUEUE_QUEUE, {
      connection: moduleRef.get(IORedis),
    });
    messageQueueService = moduleRef.get(MessageQueueService);
    prismaService = moduleRef.get(PrismaService);
    serverResolver = moduleRef.get(ServerResolver);
    userFactory = moduleRef.get(UserFactory);
  });

  describe("createCronJob", () => {
    describe("with a valid access token and an active subscription", () => {
      it("should delete previous cron jobs, create new cron jobs, and return SUCCESS", async () => {
        const user = await userFactory.create({
          paypalSubscriptionStatus: PaypalSubscriptionStatus.ACTIVE,
        });
        const previousRedisCronJob = await cronJobQueue.add(
          faker.random.alphaNumeric(),
          {},
        );
        const previousDbCronJob = await cronJobFactory.create({
          jobId: previousRedisCronJob.id,
          path: "previous-path",
          userId: user.id,
        });

        const result = await serverResolver.createCronJobs(user.accessToken, [
          {
            path: "path",
            schedule: "* * * * *",
          },
        ]);

        expect(
          await cronJobQueue.getJob(previousRedisCronJob.id),
        ).toBeUndefined();

        expect(
          await cronJobService.findUnique({ id: previousDbCronJob.id }),
        ).toBeNull();

        const newDbCronJob = await cronJobService.findFirst({
          user: { id: user.id },
          path: "path",
        });
        expect(newDbCronJob).not.toBeNull();

        const newRedisCronJob = await cronJobQueue.getJob(newDbCronJob.jobId);
        expect(newRedisCronJob).not.toBeNull();

        expect(result).toEqual(Result.SUCCESS);
      });
    });

    describe("with an invalid access token", () => {
      it("should return INVALID_TOKEN", async () => {
        const user = await userFactory.create({
          paypalSubscriptionStatus: PaypalSubscriptionStatus.ACTIVE,
        });

        const result = await serverResolver.createCronJobs(
          "wrong-access-token",
          [
            {
              path: "path",
              schedule: "* * * * *",
            },
          ],
        );

        const cronJob = await cronJobService.findFirst({
          user: { id: user.id },
        });
        expect(cronJob).toBeNull();
        expect(result).toEqual(Result.INVALID_TOKEN);
      });
    });

    describe("with a non-active subscription status", () => {
      it("should not create cron jobs and should return INACTIVE_SUBSCRIPTION", async () => {
        const user = await userFactory.create({
          paypalSubscriptionStatus: null,
        });

        const result = await serverResolver.createCronJobs(user.accessToken, [
          {
            path: "path",
            schedule: "* * * * *",
          },
        ]);

        const cronJob = await cronJobService.findFirst({
          user: { id: user.id },
        });
        expect(cronJob).toBeNull();
        expect(result).toEqual(Result.INACTIVE_SUBSCRIPTION);
      });
    });
  });

  describe("createMessageQueues", () => {
    describe("with a valid access token and an active subscription", () => {
      it("should delete previous message queues, create new message queues, and return SUCCESS", async () => {
        const user = await userFactory.create({
          paypalSubscriptionStatus: PaypalSubscriptionStatus.ACTIVE,
        });
        const previousMessageQueue = await messageQueueFactory.create({
          userId: user.id,
        });

        const result = await serverResolver.createMessageQueues(
          user.accessToken,
          [
            {
              name: "name",
              path: "path",
            },
          ],
        );

        expect(result).toEqual(Result.SUCCESS);

        expect(
          await messageQueueService.findUnique({ id: previousMessageQueue.id }),
        ).toBeNull();

        expect(
          await messageQueueService.findUnique({
            name_userId: {
              name: "name",
              userId: user.id,
            },
          }),
        ).not.toBeNull();
      });
    });

    describe("with an invalid access token", () => {
      it("should return INVALID_TOKEN", async () => {
        const result = await serverResolver.createMessageQueues(
          "wrong-access-token",
          [
            {
              name: "name",
              path: "path",
            },
          ],
        );

        expect(result).toEqual(Result.INVALID_TOKEN);
      });
    });

    describe("with a non-active subscription", () => {
      it("should not create message queues and should return INACTIVE_SUBSCRIPTION", async () => {
        const user = await userFactory.create({
          paypalSubscriptionStatus: null,
        });

        const result = await serverResolver.createMessageQueues(
          user.accessToken,
          [
            {
              name: "name",
              path: "path",
            },
          ],
        );

        expect(
          await messageQueueService.findFirst({ userId: user.id }),
        ).toBeNull();
        expect(result).toEqual(Result.INACTIVE_SUBSCRIPTION);
      });
    });
  });

  describe("enqueueMessage", () => {
    describe("with a valid access token, queue name, positive jobs remaining, and active subscription", () => {
      it("should enqueue a message and return SUCCESS", async () => {
        const user = await userFactory.create({
          jobsRemaining: 1,
          paypalSubscriptionStatus: PaypalSubscriptionStatus.ACTIVE,
        });
        const messageQueue = await prismaService.messageQueue.create({
          data: {
            name: "queue-name",
            path: "queue-path",
            userId: user.id,
          },
        });

        const result = await serverResolver.enqueueMessage(
          user.accessToken,
          messageQueue.name,
          "data",
        );

        expect(result).toEqual(EnqueueMessageResult.SUCCESS);
      });
    });

    describe("with an unknown queue name", () => {
      it("should return QUEUE_NOT_FOUND", async () => {
        const user = await userFactory.create({
          jobsRemaining: 1,
          paypalSubscriptionStatus: PaypalSubscriptionStatus.ACTIVE,
        });

        const result = await serverResolver.enqueueMessage(
          user.accessToken,
          "unknown-queue",
          "data",
        );

        expect(result).toEqual(EnqueueMessageResult.QUEUE_NOT_FOUND);
      });
    });

    describe("with zero jobs remaining", () => {
      it("should return NO_JOBS_REMAINING", async () => {
        const user = await userFactory.create({
          jobsRemaining: 0,
          paypalSubscriptionStatus: PaypalSubscriptionStatus.ACTIVE,
        });

        const result = await serverResolver.enqueueMessage(
          user.accessToken,
          "queue-name",
          "data",
        );

        expect(result).toEqual(EnqueueMessageResult.NO_JOBS_REMAINING);
      });
    });

    describe("with an unknown access token", () => {
      it("should return INVALID_TOKEN", async () => {
        const result = await serverResolver.enqueueMessage(
          "wrong-access-token",
          "queue-name",
          "data",
        );

        expect(result).toEqual(EnqueueMessageResult.INVALID_TOKEN);
      });
    });

    describe("with a non-active subscription", () => {
      it("should not enqueue a message and should return INACTIVE_SUBSCRIPTION", async () => {
        const user = await userFactory.create({
          paypalSubscriptionStatus: null,
        });

        const result = await serverResolver.enqueueMessage(
          user.accessToken,
          "queue-name",
          "data",
        );

        expect(result).toEqual(EnqueueMessageResult.INACTIVE_SUBSCRIPTION);
      });
    });
  });
});
