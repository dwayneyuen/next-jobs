import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ServerResolver } from "src/graphql/server.resolver";
import { EnvironmentVariablesModule } from "src/environment-variables.module";
import { RedisModule } from "src/redis.module";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  exports: [],
  imports: [EnvironmentVariablesModule, HttpModule, PrismaModule, RedisModule],
  providers: [ServerResolver],
})
export class ResolverModule {}
