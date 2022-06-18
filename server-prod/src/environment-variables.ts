import { Injectable } from "@nestjs/common";

/**
 * @property NEXT_JOBS_ACCESS_TOKEN Used to authenticate requests
 *
 * @property NEXT_JOBS_BASE_URL URL of the server to call back to execute jobs.
 * For example this might be your VERCEL_URL if your Next.js project is deployed
 * to Vercel.
 *
 * @property NEXT_JOBS_REDIS_URL Used to store jobs and queues
 */
@Injectable()
export class EnvironmentVariables {
  NEXT_JOBS_ACCESS_TOKEN = process.env.NEXT_JOBS_ACCESS_TOKEN;
  NEXT_JOBS_BASE_URL =
    process.env.NEXT_JOBS_BASE_URL ?? "http://localhost:3000";
  NEXT_JOBS_CONCURRENCY_LIMIT = parseInt(
    process.env.NEXT_JOBS_CONCURRENCY_LIMIT ?? "10",
  );
  NEXT_JOBS_MAX_JOB_DURATION = parseInt(
    process.env.NEXT_JOBS_MAX_JOB_DURATION ?? "30000",
  );
  NEXT_JOBS_REDIS_URL =
    process.env.NEXT_JOBS_REDIS_URL ?? "redis://localhost:6379";
  NEXT_JOBS_PORT = process.env.NEXT_JOBS_PORT ?? 5678;
}
