import { JobQueue } from "@dwayneyuen/next-jobs";

const foo = {
  QueueExample: JobQueue("object-queue", (job) => {
    console.log(job);
  }),
};

export default foo.QueueExample;
