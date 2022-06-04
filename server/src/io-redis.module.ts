import { Module } from "@nestjs/common";
import { config } from "dotenv";
import IORedis from "ioredis";
import { EnvironmentVariables } from "src/environment-variables";

config();

const environmentVariables = new EnvironmentVariables();

@Module({
  exports: [IORedis],
  providers: [
    {
      provide: IORedis,
      // maxRetriesPerRequest must be null for bullmq, I don't know why
      useValue: new IORedis(environmentVariables.NEXT_JOBS_REDIS_URL, {
        maxRetriesPerRequest: null,
      }),
    },
  ],
})
export class IORedisModule {}
