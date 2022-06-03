import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { BullModule } from "@nestjs/bull";
import { ServerResolver } from "src/graphql/server.resolver";
import { EnvironmentVariablesModule } from "src/environment-variables.module";
import { IORedisModule } from "src/io-redis.module";

@Module({
  exports: [],
  imports: [
    BullModule.registerQueue({ name: "jobs" }),
    BullModule.registerQueue({ name: "queues" }),

    EnvironmentVariablesModule,
    HttpModule,
    IORedisModule,
  ],
  providers: [ServerResolver],
})
export class ResolverModule {}
