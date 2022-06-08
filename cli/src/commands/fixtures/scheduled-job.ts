import { ScheduledJob } from "@dwayneyuen/next-jobs";

const ScheduledJobExample = ScheduledJob("* * * * *", () => {
  console.log("");
});

export default ScheduledJobExample;
