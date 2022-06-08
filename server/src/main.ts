#!/usr/bin/env node

import { NestFactory } from "@nestjs/core";
import { config } from "dotenv";
import { AppModule } from "./app.module";
import { EnvironmentVariables } from "src/environment-variables";

async function bootstrap() {
  config();

  const environmentVariables = new EnvironmentVariables();
  if (environmentVariables.NEXT_JOBS_SELF_HOSTED) {
    if (!environmentVariables.NEXT_JOBS_ACCESS_TOKEN) {
      throw new Error(
        "NEXT_JOBS_ACCESS_TOKEN must be defined for self-hosting!",
      );
    }
    if (!environmentVariables.NEXT_JOBS_BASE_URL) {
      throw new Error("NEXT_JOBS_BASE_URL must be defined for self-hosting!");
    }
  } else {
    if (!environmentVariables.NEXT_JOBS_API_URL) {
      if (!environmentVariables.NEXT_JOBS_BASE_URL) {
        throw new Error(
          "NEXT_JOBS_API_URL must be defined for production hosting!",
        );
      }
    }
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(environmentVariables.NEXT_JOBS_PORT);
}

bootstrap();
