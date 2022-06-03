import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { BullModule } from "@nestjs/bull";
import { ServerResolver } from "src/graphql/server.resolver";
import { EnvironmentVariablesModule } from "src/environment-variables.module";
import { IORedisModule } from "src/io-redis.module";
import { ScheduledJobsConsumer } from "src/scheduled-jobs.consumer";
import { QueuesConsumer } from "src/queues.consumer";

@Module({
  exports: [],
  imports: [
    BullModule.registerQueue({ name: "jobs" }),
    BullModule.registerQueue({ name: "queues" }),
    EnvironmentVariablesModule,
    HttpModule,
    IORedisModule,
  ],
  providers: [ServerResolver, QueuesConsumer, ScheduledJobsConsumer],
})
export class ResolverModule {}
