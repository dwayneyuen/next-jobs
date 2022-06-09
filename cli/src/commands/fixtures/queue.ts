import { JobQueue } from "@dwayneyuen/next-jobs";
import { NextApiHandler } from "next";

const QueueExample: NextApiHandler = JobQueue("queue", (job) => {
  console.log(job);
});

export default QueueExample;
