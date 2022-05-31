import { Resolver } from "@nestjs/graphql";
import { ScheduledJobModel } from "src/graphql/scheduled-jobs/scheduled-job.model";

@Resolver(() => ScheduledJobModel)
export class ScheduledJobsResolver {}
