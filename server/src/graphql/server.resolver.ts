import { Args, Field, Mutation, ObjectType, Resolver } from "@nestjs/graphql";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { Logger } from "@nestjs/common";
import { EnvironmentVariables } from "src/environment-variables";

@ObjectType()
class CreateScheduledJobResponse {
  @Field()
  result: "success" | "invalid-token";
}

@ObjectType()
class CreateQueueResponse {
  @Field()
  result: "success" | "invalid-token";
}

/**
 * Catch-all resolver for the next-jobs server
 */
@Resolver()
export class ServerResolver {
  constructor(
    private environmentVariables: EnvironmentVariables,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

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
  @Mutation(() => CreateScheduledJobResponse)
  async createScheduledJob(
    // TODO: Add guard for access token authentication
    @Args("accessToken") accessToken: string,
    @Args("name") name: string,
    @Args("path") path: string,
    @Args("schedule") schedule: string,
  ): Promise<CreateScheduledJobResponse> {
    // Self-hosted
    if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN) {
      if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
        return { result: "invalid-token" };
      }
      const job = new CronJob(schedule, () => {
        Logger.log(
          `[CronJob] name: ${name}, path: ${path}, schedule: ${schedule}`,
        );
      });
      this.schedulerRegistry.addCronJob(name, job);
      return { result: "success" };
    }
  }

  @Mutation(() => CreateQueueResponse)
  async createQueue(
    // TODO: Add guard for access token authentication
    @Args("accessToken") accessToken: string,
    @Args("name") name: string,
    @Args("path") path: string,
    @Args("schedule") schedule: string,
  ): Promise<CreateQueueResponse> {
    // Self-hosted
    if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN) {
      if (this.environmentVariables.NEXT_JOBS_ACCESS_TOKEN !== accessToken) {
        return { result: "invalid-token" };
      }
    }
    return { result: "invalid-token" };
  }
}
