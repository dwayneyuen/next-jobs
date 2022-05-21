/**
 * Implementation of RepeatableJob
 *
 * Takes in a cron schedule and a callback and executes the callback each iteration.
 * Returns a NextApiHandler so that it can be used as an API route.
 *
 * Calling the API directly executes the callback manually.
 *
 */
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { Job, Queue, QueueScheduler, RepeatOptions, Worker } from "bullmq";
import { logger } from "./logger";

export type RepeatableJobCallbackType = (() => Promise<void>) | (() => void);

type RepeatableJobType = {
  callback: RepeatableJobCallbackType;
  name: string;
};

function RepeatableJob<T>(
  repeatOptions: RepeatOptions,
  callback: RepeatableJobCallbackType
): { start(): Promise<void> } & NextApiHandler {
  const jobName = __filename
    .replace(__dirname, "")
    .replace(/^\//g, "")
    .replace("///g", "-");

  new QueueScheduler(jobName, {
    connection: { host: "localhost", port: 6379 },
  });
  const queue = new Queue<RepeatableJobType>(jobName, {
    connection: { host: "localhost", port: 6379 },
  });

  const worker = new Worker<RepeatableJobType>(
    jobName,
    async (job: Job<RepeatableJobType>) => {
      logger.info(`[RepeatableJob.${jobName}] processing name: ${job.name}`);
      await callback();
    },
    { connection: { host: "localhost", port: 6379 } }
  );

  worker.on("completed", (job: Job<RepeatableJobType>) => {
    logger.info(`[RepeatableJob.${jobName}] completed: ${job.data.name}`);
  });

  worker.on("failed", (job: Job<RepeatableJobType>, error: Error) => {
    logger.info(
      `[RepeatableJob.${jobName}] failed: ${job.data.name}, error: ${error}`
    );
  });

  const nextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }

    logger.info(`[RepeatableJob.${jobName}] called manually`);
    await callback();
    res.status(200).end();
  };

  nextApiHandler.start = async () => {
    logger.info(`[RepeatableJob.${jobName}] started`);
    await queue.add(jobName, { callback, name: jobName }, { ...repeatOptions });
  };

  return nextApiHandler;
}

export default RepeatableJob;
