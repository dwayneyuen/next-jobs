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
 * @property NEXT_JOBS_REDIS_PORT Self-explanatory
 * @property NEXT_JOBS_REDIS_URL Self-explanatory
 */
@Injectable()
export class EnvironmentVariables {
  NEXT_JOBS_ACCESS_TOKEN = process.env.NEXT_JOBS_ACCESS_TOKEN;
  NEXT_JOBS_API_URL = process.env.NEXT_JOBS_API_URL;
  NEXT_JOBS_BASE_URL = process.env.NEXT_JOBS_BASE_URL;
  NEXT_JOBS_REDIS_PORT = parseInt(process.env.NEXT_JOBS_REDIS_PORT) ?? 6379;
  NEXT_JOBS_REDIS_URL = process.env.NEXT_JOBS_REDIS_URL ?? "localhost";
}
