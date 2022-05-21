import { JobQueue } from "@dwayneyuen/next-jobs";
import { NextApiHandler } from "next";

const QueueExample: NextApiHandler = JobQueue((job) => {
  console.log(job);
});

export default QueueExample;
