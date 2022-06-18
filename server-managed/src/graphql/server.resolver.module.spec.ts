import { randomUUID } from "crypto";
import { Test } from "@nestjs/testing";
import { ApolloClient } from "@apollo/client";
import { HttpService } from "@nestjs/axios";
import { Result, ServerResolver } from "src/graphql/server.resolver";
import { EnvironmentVariables } from "src/environment-variables";
import { ApolloClientFake } from "src/apollo-client.fake";
import { HttpServiceFake } from "src/http-service.fake";
import { UserService } from "src/prisma/user.service";
import { UserFactory } from "test/factories/user.factory";

describe("ResolverModule", () => {
  let jobName: string;
  let queueName: string;
  let serverResolver: ServerResolver;
  let userFactory: UserFactory;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: EnvironmentVariables,
          useValue: new EnvironmentVariables(),
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
        UserFactory,
        UserService,
      ],
    }).compile();

    serverResolver = moduleRef.get(ServerResolver);
    userFactory = moduleRef.get(UserFactory);
  });

  describe("createCronJob", () => {
    describe("with an invalid access token", () => {
      it("should not create a job and return invalid-token", async () => {
        jobName = randomUUID();
        const result = await serverResolver.createCronJobs(
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
        const result = await serverResolver.createCronJobs("access-token", [
          {
            name: jobName,
            path: "path",
            schedule: "* * * * *",
          },
        ]);

        expect(result).toEqual(Result.SUCCESS);
      });
    });

    describe("with a non-active subscription status", () => {
      it("should not create a job and return inactive subscription", async () => {
        jobName = randomUUID();
        await userFactory.create({
          accessToken: "access-token",
          paypalSubscriptionStatus: null,
        });
        const result = await serverResolver.createCronJobs("access-token", [
          {
            name: jobName,
            path: "path",
            schedule: "* * * * *",
          },
        ]);

        expect(result).toEqual(Result.INACTIVE_SUBSCRIPTION);
      });
    });
  });

  // describe("createJobQueues", () => {
  //   describe("with an invalid access token", async () => {
  //     it("should not create a job queue and return INVALID_TOKEN", async () => {});
  //   });
  //
  //   describe("with a non-active subscription", async () => {
  //     it("should not create a job queue and return INACTIVE_SUBSCRIPTION", async () => {});
  //   });
  // });
});
