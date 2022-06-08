import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { logger } from "./logger";
import { config } from "dotenv";

config();

type JobQueueCallbackType<T> = ((job: T) => Promise<void>) | ((job: T) => void);

function JobQueue<T>(
  callback: JobQueueCallbackType<T>
): { enqueue(job: T): Promise<void> } & NextApiHandler {
  const queueName = __filename
    .replace(__dirname, "")
    .replace(/^\//g, "")
    .replace("///g", "-");
  logger.info(`[JobQueue] created job queue: ${queueName}`);

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

  // TODO: Make an API call
  nextApiHandler.enqueue = async (job: T) => {
    // await queue.add(queueName, job);
  };

  return nextApiHandler;
}

export default JobQueue;
