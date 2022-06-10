import { Injectable } from "@nestjs/common";

/**
 * @property NEXT_JOBS_ACCESS_TOKEN Needed for self-hosting. This token is
 * compared to job creation requests to authenticate requests.
 *
 * @property NEXT_JOBS_BASE_URL Needed for self-hosting. URL of the server to
 * execute the job calls. For example this might be your VERCEL_URL if your
 * Next.js project is deployed to Vercel.
 *
 * @property NEXT_JOBS_API_URL Not needed for self-hosting. This is the external
 * API server used to validate access tokens. The API server knows about access
 * tokens of all registered users and their registered ase urls.
 *
 * @property NEXT_JOBS_REDIS_URL Used to store jobs and queues
 */
@Injectable()
export class EnvironmentVariables {
  NEXT_JOBS_ACCESS_TOKEN = process.env.NEXT_JOBS_ACCESS_TOKEN;
  NEXT_JOBS_API_URL = process.env.NEXT_JOBS_API_URL;
  NEXT_JOBS_BASE_URL =
    process.env.NEXT_JOBS_BASE_URL ?? "http://localhost:3000";
  // NEXT_JOBS_REDIS_HOST = process.env.NEXT_JOBS_REDIS_HOST ?? "localhost";
  // NEXT_JOBS_REDIS_PORT = process.env.NEXT_JOBS_REDIS_PORT
  //   ? parseInt(process.env.NEXT_JOBS_REDIS_PORT)
  //   : 6379;
  NEXT_JOBS_REDIS_URL =
    process.env.NEXT_JOBS_REDIS_URL ?? "redis://localhost:6379";
  NEXT_JOBS_PORT = process.env.NEXT_JOBS_PORT ?? 5678;
}
