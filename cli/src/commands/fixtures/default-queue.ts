import { JobQueue } from "@dwayneyuen/next-jobs";

export default JobQueue("default-queue", (job) => {
  console.log(job);
});
