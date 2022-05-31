import { Module } from "@nestjs/common";
import { EnvironmentVariables } from "src/environment-variables";

@Module({
  providers: [EnvironmentVariables],
})
export class EnvironmentVariablesModule {}
