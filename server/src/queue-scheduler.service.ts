import { Injectable } from "@nestjs/common";
import IORedis from "ioredis";
import { QueueScheduler } from "bullmq";
import { JOBS, QUEUES } from "src/graphql/server.resolver";

/**
 * Container to instantiate queue schedulers for bullmq
 *
 * https://docs.bullmq.io/guide/queuescheduler
 */
@Injectable()
export class QueueSchedulerService {
  private jobsScheduler: QueueScheduler;
  private queueScheduler: QueueScheduler;

  constructor(private ioRedis: IORedis) {
    this.jobsScheduler = new QueueScheduler(JOBS, { connection: ioRedis });
    this.queueScheduler = new QueueScheduler(QUEUES, { connection: ioRedis });
  }
}
