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
      useValue: new IORedis(environmentVariables.NEXT_CRON_REDIS_URL, {
        // maxRetriesPerRequest must be null for bullmq
        maxRetriesPerRequest: null,
      }),
    },
  ],
})
export class RedisModule {}
