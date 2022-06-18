import { Module } from "@nestjs/common";
import { EnvironmentVariables } from "src/environment-variables";

@Module({
  exports: [EnvironmentVariables],
  providers: [EnvironmentVariables],
})
export class EnvironmentVariablesModule {}
