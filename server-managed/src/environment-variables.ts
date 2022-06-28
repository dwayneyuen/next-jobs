import { Injectable } from "@nestjs/common";

@Injectable()
export class EnvironmentVariables {
  NEXT_CRON_CONCURRENCY_LIMIT = parseInt(
    process.env.NEXT_CRON_CONCURRENCY_LIMIT ?? "10",
  );
  NEXT_CRON_MAX_JOB_DURATION = parseInt(
    process.env.NEXT_CRON_MAX_JOB_DURATION ?? "30000",
  );
  NEXT_CRON_REDIS_URL =
    process.env.NEXT_CRON_REDIS_URL ?? "redis://localhost:6379";
  NEXT_CRON_PORT = process.env.NEXT_CRON_PORT ?? 5678;
}
