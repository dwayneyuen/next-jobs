import { JobQueue } from "@dwayneyuen/next-jobs";

export default JobQueue((job) => {
  console.log(job);
});
