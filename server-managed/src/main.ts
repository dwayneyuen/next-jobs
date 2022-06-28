#!/usr/bin/env node

import { NestFactory } from "@nestjs/core";
import { config } from "dotenv";
import { AppModule } from "./app.module";
import { EnvironmentVariables } from "src/environment-variables";

async function bootstrap() {
  config();
  const app = await NestFactory.create(AppModule);
  const environmentVariables = new EnvironmentVariables();
  await app.listen(environmentVariables.NEXT_CRON_PORT);
}

bootstrap();
