#!/usr/bin/env node

import { NestFactory } from "@nestjs/core";
import { config } from "dotenv";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { EnvironmentVariables } from "src/environment-variables";
import { ParserService } from "src/parser.service";

async function bootstrap() {
  config();

  Logger.log(`Updated 8:52 PM - CWD: ${process.cwd()}`);
  // TODO: Load config using config module to load from .env.local to match nextjs
  // https://docs.nestjs.com/techniques/configuration#custom-env-file-path

  const app = await NestFactory.create(AppModule);

  const environmentVariables = new EnvironmentVariables();
  if (environmentVariables.NEXT_JOBS_ACCESS_TOKEN) {
    const parserService = app.get(ParserService);
    await parserService.parse();
  }

  await app.listen(environmentVariables.NEXT_JOBS_PORT);
}

bootstrap();
