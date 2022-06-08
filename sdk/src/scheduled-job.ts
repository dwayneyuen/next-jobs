/**
 * Implementation of ScheduledJob
 *
 * Takes in a cron schedule and a callback and executes the callback each iteration.
 * Returns a NextApiHandler so that it can be used as an API route.
 *
 * Calling the API directly executes the callback manually.
 *
 */
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { logger } from "./logger";

export type ScheduledJobCallbackType = (() => Promise<void>) | (() => void);

/**
 * TODO: Allow full RepeatOptions
 * @param schedule
 * @param callback
 * @constructor
 */
function ScheduledJob<T>(
  schedule: string,
  callback: ScheduledJobCallbackType
): NextApiHandler {
  let initialized = false;
  const jobName = __filename
    .replace(__dirname, "")
    .replace(/^\//g, "")
    .replace("///g", "-");

  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }

    logger.info(`[ScheduledJob.${jobName}] called manually`);
    await callback();
    res.status(200).end();
  };
}

export default ScheduledJob;
