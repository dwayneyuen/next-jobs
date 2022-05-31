import { randomUUID } from "crypto";
import { Test } from "@nestjs/testing";
import { ScheduleModule, SchedulerRegistry } from "@nestjs/schedule";
import { ServerResolver } from "src/graphql/server.resolver";
import { EnvironmentVariables } from "src/environment-variables";

class SelfHostedEnvironmentVariables {
  NEXT_JOBS_ACCESS_TOKEN = "access-token";
  NEXT_JOBS_API_URL = null;
  NEXT_JOBS_BASE_URL = "base-url";
  NEXT_JOBS_REDIS_PORT = 6379;
  NEXT_JOBS_REDIS_URL = "localhost";
}

class ProductionEnvironmentVariables {
  NEXT_JOBS_ACCESS_TOKEN = null;
  NEXT_JOBS_API_URL = "api-url";
  NEXT_JOBS_BASE_URL = null;
  NEXT_JOBS_REDIS_PORT = 6379;
  NEXT_JOBS_REDIS_URL = "localhost";
}

describe("ResolverModule", () => {
  let jobName: string;
  let schedulerRegistry: SchedulerRegistry;
  let serverResolver: ServerResolver;

  describe("self-hosting", () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [ScheduleModule.forRoot()],
        providers: [
          {
            provide: EnvironmentVariables,
            useValue: new SelfHostedEnvironmentVariables(),
          },
          ServerResolver,
        ],
      }).compile();

      schedulerRegistry = moduleRef.get(SchedulerRegistry);
      serverResolver = moduleRef.get(ServerResolver);
    });

    afterEach(() => {
      try {
        schedulerRegistry.deleteCronJob(jobName);
      } catch (error) {}
    });

    describe("createScheduledJob", () => {
      describe("with an invalid access token", () => {
        it("should not create a job and return invalid-token", async () => {
          jobName = randomUUID();
          const result = await serverResolver.createScheduledJob(
            "wrong-access-token",
            jobName,
            "path",
            "* * * * *",
          );

          expect(result.result).toEqual("invalid-token");
          expect(() => {
            schedulerRegistry.getCronJob(jobName);
          }).toThrow(Error);
        });
      });

      describe("with a valid access token", () => {
        it("should create a job and return success", async () => {
          jobName = randomUUID();
          const result = await serverResolver.createScheduledJob(
            "access-token",
            jobName,
            "path",
            "* * * * *",
          );

          expect(result.result).toEqual("success");
          expect(() => {
            schedulerRegistry.getCronJob(jobName);
          }).not.toThrow(Error);
        });
      });
    });
  });

  describe("production hosting", () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [ScheduleModule.forRoot()],
        providers: [
          {
            provide: EnvironmentVariables,
            useValue: new ProductionEnvironmentVariables(),
          },
          ServerResolver,
        ],
      }).compile();

      schedulerRegistry = moduleRef.get(SchedulerRegistry);
      serverResolver = moduleRef.get(ServerResolver);
    });

    describe("createScheduledJob", () => {
      describe("with an invalid access token", () => {
        it("should not create a job and return invalid-token", async () => {
          jobName = randomUUID();
          const result = await serverResolver.createScheduledJob(
            "wrong-access-token",
            jobName,
            "path",
            "* * * * *",
          );

          expect(result.result).toEqual("invalid-token");
          expect(() => {
            schedulerRegistry.getCronJob(jobName);
          }).toThrow(Error);
        });
      });

      describe("with a valid access token", () => {
        it("should create a job and return success", async () => {
          jobName = randomUUID();
          const result = await serverResolver.createScheduledJob(
            "access-token",
            jobName,
            "path",
            "* * * * *",
          );

          expect(result.result).toEqual("success");
          expect(() => {
            schedulerRegistry.getCronJob(jobName);
          }).not.toThrow(Error);
        });
      });
    });
  });
});
