import { randomUUID } from "crypto";
import { Test } from "@nestjs/testing";
import { ApolloClient } from "@apollo/client";
import { HttpService } from "@nestjs/axios";
import { Result, ServerResolver } from "src/graphql/server.resolver";
import { EnvironmentVariables } from "src/environment-variables";
import { ApolloClientFake } from "src/apollo-client.fake";
import { HttpServiceFake } from "src/http-service.fake";

class SelfHostedEnvironmentVariables {
  NEXT_JOBS_ACCESS_TOKEN = "access-token";
  NEXT_JOBS_API_URL = null;
  NEXT_JOBS_BASE_URL = "base-url";
  NEXT_JOBS_REDIS_URL = "redis://localhost:6379";
}

describe("ResolverModule", () => {
  let jobName: string;
  let queueName: string;
  let serverResolver: ServerResolver;

  describe("self-hosting", () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          {
            provide: EnvironmentVariables,
            useValue: new SelfHostedEnvironmentVariables(),
          },
          {
            provide: ApolloClient,
            useValue: new ApolloClientFake(),
          },
          {
            provide: HttpService,
            useValue: new HttpServiceFake(),
          },
          ServerResolver,
        ],
      }).compile();

      serverResolver = moduleRef.get(ServerResolver);
    });

    describe("createScheduledJob", () => {
      describe("with an invalid access token", () => {
        it("should not create a job and return invalid-token", async () => {
          jobName = randomUUID();
          const result = await serverResolver.createScheduledJobs(
            "wrong-access-token",
            [
              {
                name: jobName,
                path: "path",
                schedule: "* * * * *",
              },
            ],
          );

          expect(result).toEqual(Result.INVALID_TOKEN);
        });
      });

      describe("with a valid access token", () => {
        it("should create a job and return success", async () => {
          jobName = randomUUID();
          const result = await serverResolver.createScheduledJobs(
            "access-token",
            [
              {
                name: jobName,
                path: "path",
                schedule: "* * * * *",
              },
            ],
          );

          expect(result).toEqual(Result.SUCCESS);
        });
      });
    });
  });
});
