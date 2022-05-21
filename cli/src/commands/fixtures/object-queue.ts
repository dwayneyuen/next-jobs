import { JobQueue } from "@dwayneyuen/next-jobs";

const foo = {
  QueueExample: JobQueue((job) => {
    console.log(job);
  }),
};

export default foo.QueueExample;
