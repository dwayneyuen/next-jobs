import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { config } from "dotenv";
import { gql } from "@apollo/client";
import { logger } from "./logger";
import apolloClient from "./apollo-client";

config();

type JobQueueCallbackType<T> = ((job: T) => Promise<void>) | ((job: T) => void);

/**
 * Implementation of a message queue
 *
 * Send messages to this API to process the message
 */
function JobQueue<T extends Record<string, any>>(
  queueName: string,
  callback: JobQueueCallbackType<T>
): { enqueue(job: T): Promise<void> } & NextApiHandler {
  const nextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }

    if (req.body.accessToken === process.env.NEXT_JOBS_ACCESS_TOKEN) {
      await callback(JSON.parse(req.body.data));
      res.status(200).end();
    } else {
      res.status(401).end();
    }
  };

  nextApiHandler.enqueue = async (data: T) => {
    const result = await apolloClient.mutate({
      mutation: gql`
        mutation enqueueJob(
          $accessToken: String!
          $data: String!
          $queueName: String!
        ) {
          enqueueJob(
            accessToken: $accessToken
            data: $data
            queueName: $queueName
          )
        }
      `,
      variables: {
        accessToken: process.env.NEXT_JOBS_ACCESS_TOKEN,
        data: JSON.stringify(data),
        queueName,
      },
    });
    logger.debug(`Enqueue job result: ${result.data}`);
  };

  return nextApiHandler;
}

export default JobQueue;
