/**
 * Implementation of ScheduledJob
 *
 * Takes in a cron schedule and a callback and executes the callback each iteration.
 * Returns a NextApiHandler so that it can be used as an API route.
 */
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export type ScheduledJobCallbackType = (() => Promise<void>) | (() => void);

function ScheduledJob(
  schedule: string,
  callback: ScheduledJobCallbackType
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }

    if (req.body.accessToken === process.env.NEXT_JOBS_ACCESS_TOKEN) {
      await callback();
      res.status(200).end();
    } else {
      res.status(401).end();
    }
  };
}

export default ScheduledJob;
