import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { Job, Queue, Worker } from "bullmq";
import { logger } from "./logger";

type JobQueueCallbackType<T> = ((job: T) => Promise<void>) | ((job: T) => void);

function JobQueue<T>(
  callback: JobQueueCallbackType<T>
): { add(job: T): Promise<void> } & NextApiHandler {
  const queueName = __filename
    .replace(__dirname, "")
    .replace(/^\//g, "")
    .replace("///g", "-");
  logger.info(`[JobQueue] created job queue: ${queueName}`);
  const queue = new Queue<T>(queueName, {
    connection: { host: "localhost", port: 6379 },
  });

  const worker = new Worker<T>(
    queueName,
    async (job: Job<T>) => {
      logger.info(
        `[JobQueue.${queueName}] processing name: ${job.name}, data: ${job.data}`
      );
      await callback(job.data);
    },
    { connection: { host: "localhost", port: 6379 } }
  );

  worker.on("completed", (job: Job<T>) => {
    logger.info(`[JobQueue.${queueName}] completed ${job.name}`);
  });

  worker.on("failed", (job: Job<T>, error: Error) => {
    logger.info(`[JobQueue.${queueName}] failed ${job.name}, error: ${error}`);
  });

  const nextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }

    logger.info(
      `[JobQueue.${queueName}] called manually with: ${JSON.stringify(
        req.body
      )}`
    );
    callback(req.body);
    res.status(200).end();
  };

  nextApiHandler.add = async (job: T) => {
    await queue.add(queueName, job);
  };

  return nextApiHandler;
}

export default JobQueue;
