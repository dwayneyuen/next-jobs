/**
 * Takes in a cron schedule and a callback and executes the callback each iteration.
 * Returns a NextApiHandler so that it can be used as an API route.
 */
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export type CronJobCallbackType = (() => Promise<void>) | (() => void);

function CronJob(
  schedule: string,
  callback: CronJobCallbackType
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }

    if (req.body.accessToken === process.env.NEXT_CRON_ACCESS_TOKEN) {
      await callback();
      res.status(200).end();
    } else {
      res.status(401).end();
    }
  };
}

export default CronJob;
