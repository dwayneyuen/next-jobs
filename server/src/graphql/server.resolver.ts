import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  registerEnumType,
  Resolver,
} from "@nestjs/graphql";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { Delete, Logger } from "@nestjs/common";
import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";
import { HttpService } from "@nestjs/axios";
import { EnvironmentVariables } from "src/environment-variables";

enum CreateScheduledJobResult {
  SUCCESS,
  INVALID_TOKEN,
  NOT_IMPLEMENTED,
}

enum DeleteScheduledJobsResult {
  SUCCESS,
  INVALID_TOKEN,
  NOT_IMPLEMENTED,
}

registerEnumType(CreateScheduledJobResult, {
  name: "CreateScheduledJobResult",
});

registerEnumType(DeleteScheduledJobsResult, {
  name: "DeleteScheduledJobsResult",
});

// @ObjectType()
// class CreateScheduledJobResponse {
//   @Field()
//   result: "success" | "invalid-token" | "not-implemented";
// }
//
// @ObjectType()
// class DeleteScheduledJobResponse {
//   @Field()
//   result: "success" | "invalid-token" | "not-implemented";
// }

/**
 * Catch-all resolver for the next-jobs server
 */
@Resolver()
export class ServerResolver {
  constructor(
    private environmentVariables: EnvironmentVariables,
    private httpService: HttpService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Query must be defined to be a valid graphql resolver
   */
  @Query(() => String)
  async foo(): Promise<string> {
    return "foo";
  }

  /**
   * Mutation to create a scheduled job
   *
   * For self-hosting, define the environment variable NEXT_JOBS_ACCESS_TOKEN.
   * Otherwise, this will call out to another API server to validate the
   * access token.
   * @param accessToken
   * @param name
   * @param path
   * @param schedule
   */
  @Mutation(() => CreateScheduledJobResult)
  async createScheduledJob(
    // TODO: Add guard for access token authentication
    @Args("accessToken") accessToken: string,
    @Args("name") name: string,
    @Args("path") path: string,
    @Args("schedule") schedule: string,
  ): Promise<CreateScheduledJobResult> {
    Logger.log(
      `accessToken: ${accessToken}, name: ${name}, path: ${path}, schedule: ${schedule}`,
    );
    // Self-hosted
    if (this.environmentVariables.NEXT_JOBS_SELF_HOSTED) {
      if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
        return CreateScheduledJobResult.INVALID_TOKEN;
      }
      const job = new CronJob(schedule, () => {
        Logger.log(
          `[CronJob] name: ${name}, path: ${path}, schedule: ${schedule},${this.environmentVariables.NEXT_JOBS_BASE_URL}/${path}`,
        );
        // TODO: Authorization header
        this.httpService.post(
          `${this.environmentVariables.NEXT_JOBS_BASE_URL}/${path}`,
        );
      });
      this.schedulerRegistry.addCronJob(name, job);
      job.start();
      return CreateScheduledJobResult.SUCCESS;
    }
    return CreateScheduledJobResult.NOT_IMPLEMENTED;
  }

  @Mutation(() => DeleteScheduledJobsResult)
  async deleteScheduledJobs(
    @Args("accessToken") accessToken: string,
  ): Promise<DeleteScheduledJobsResult> {
    if (this.environmentVariables.NEXT_JOBS_SELF_HOSTED) {
      if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
        return DeleteScheduledJobsResult.INVALID_TOKEN;
      }
    }
    for (const name of this.schedulerRegistry.getCronJobs().keys()) {
      this.schedulerRegistry.deleteCronJob(name);
    }
    return DeleteScheduledJobsResult.SUCCESS;
  }
}
