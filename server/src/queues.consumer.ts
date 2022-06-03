import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { QUEUES } from "src/graphql/server.resolver";

// TODO: Add event listeners: https://docs.nestjs.com/techniques/queues#event-listeners
@Processor(QUEUES)
export class QueuesConsumer {
  private logger = new Logger(QueuesConsumer.name);

  @Process()
  async process(job: Job<unknown>) {
    this.logger.debug(`Processing job: ${job}`);
  }
}
