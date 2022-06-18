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
import { CRON_JOBS_QUEUE } from "src/utils";

describe("ResolverModule", () => {
  let cronJobFactory: CronJobFactory;
  let cronJobQueue: Queue;
  let cronJobService: CronJobService;
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
        ServerResolver,
        UserFactory,
      ],
    }).compile();

    cronJobFactory = moduleRef.get(CronJobFactory);
    cronJobQueue = new Queue(CRON_JOBS_QUEUE, {
      connection: moduleRef.get(IORedis),
    });
    cronJobService = moduleRef.get(CronJobService);
    serverResolver = moduleRef.get(ServerResolver);
    userFactory = moduleRef.get(UserFactory);
  });

  describe("createCronJob", () => {
    describe("with a valid access token and an active subscription", () => {
      it("should delete previous jobs, create new cron jobs, and return SUCCESS", async () => {
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
      it("should not create a job and return INVALID_TOKEN", async () => {
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
      it("should not create a job and return INACTIVE_SUBSCRIPTION", async () => {
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

  // describe("createJobQueues", () => {
  //   describe("with an invalid access token", () => {
  //     it("should not create a job queue and return INVALID_TOKEN", async () => {});
  //   });
  //
  //   describe("with a non-active subscription", () => {
  //     it("should not create a job queue and return INACTIVE_SUBSCRIPTION", async () => {});
  //   });
  // });
});
