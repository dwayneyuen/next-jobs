import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { config } from "dotenv";
import { gql } from "@apollo/client";
import { logger } from "./logger";
import apolloClient from "./apollo-client";

config();

type JobQueueCallbackType<T> = ((job: T) => Promise<void>) | ((job: T) => void);

function JobQueue<T extends Record<string, any>>(
  queueName: string,
  callback: JobQueueCallbackType<T>
): { enqueue(job: T): Promise<void> } & NextApiHandler {
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

  nextApiHandler.enqueue = async (data: T) => {
    const variables = {
      accessToken: process.env.NEXT_JOBS_ACCESS_TOKEN,
      data: JSON.stringify(data),
      queueName,
    };
    logger.info(`variables: ${JSON.stringify(variables)}`);
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
