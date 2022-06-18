import { Test } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { PaypalSubscriptionStatus } from "@dwayneyuen/next-cron-prisma";
import { faker } from "@faker-js/faker";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { Result, ServerResolver } from "src/graphql/server.resolver";
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

describe("ResolverModule", () => {
  let cronJobFactory: CronJobFactory;
  let cronJobQueue: Queue;
  let cronJobService: CronJobService;
  let messageQueueQueue: Queue;
  let messageQueueFactory: MessageQueueFactory;
  let messageQueueService: MessageQueueService;
  let serverResolver: ServerResolver;
  let userFactory: UserFactory;

  beforeEach(async () => {
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
});
