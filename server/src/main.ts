#!/usr/bin/env node

import * as fs from "fs";
import { NestFactory } from "@nestjs/core";
import { config } from "dotenv";
import { AppModule } from "./app.module";
import { EnvironmentVariables } from "src/environment-variables";
import { ParserService } from "src/parser.service";

async function bootstrap() {
  config();
  const app = await NestFactory.create(AppModule);

  const environmentVariables = new EnvironmentVariables();
  if (environmentVariables.NEXT_JOBS_ACCESS_TOKEN) {
    const parserService = app.get(ParserService);
    if (fs.existsSync("pages")) {
      await parserService.parse("pages");
    } else if (fs.existsSync("src/pages")) {
      await parserService.parse("pages");
    }
  }

  await app.listen(environmentVariables.NEXT_JOBS_PORT);
}

bootstrap();
