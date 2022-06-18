import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ServerResolver } from "src/graphql/server.resolver";
import { EnvironmentVariablesModule } from "src/environment-variables.module";
import { RedisModule } from "src/redis.module";

@Module({
  exports: [],
  imports: [EnvironmentVariablesModule, HttpModule, RedisModule],
  providers: [ServerResolver],
})
export class ResolverModule {}
