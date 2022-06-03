import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { Logger } from "@nestjs/common";
import { JOBS } from "src/graphql/server.resolver";

// TODO: Add event listeners: https://docs.nestjs.com/techniques/queues#event-listeners
@Processor(JOBS)
export class ScheduledJobsConsumer {
  private logger = new Logger(ScheduledJobsConsumer.name);

  @Process()
  async process(job: Job<unknown>) {
    this.logger.debug(`Processing job: ${JSON.stringify(job)}`);
  }
}
