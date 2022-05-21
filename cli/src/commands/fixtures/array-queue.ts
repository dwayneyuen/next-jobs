import { JobQueue } from "@dwayneyuen/next-jobs";

const foo = [
  JobQueue((job) => {
    console.log(job);
  }),
];

export default foo[0];
