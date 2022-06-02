import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ServerResolver } from "src/graphql/server.resolver";
import { EnvironmentVariablesModule } from "src/environment-variables.module";

@Module({
  exports: [],
  imports: [EnvironmentVariablesModule, HttpModule],
  providers: [ServerResolver],
})
export class ResolverModule {}
