import { JobQueue } from "@dwayneyuen/next-jobs";

const foo = [
  JobQueue("array-queue", (job) => {
    console.log(job);
  }),
];

export default foo[0];
