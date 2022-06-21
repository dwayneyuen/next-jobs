import { MessageQueue } from "@dwayneyuen/next-cron";
import { NextApiHandler } from "next";

const QueueExample: NextApiHandler = MessageQueue("queue", (job) => {
  console.log(job);
});

export default QueueExample;
