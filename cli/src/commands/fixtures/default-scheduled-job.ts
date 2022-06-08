import { ScheduledJob } from "@dwayneyuen/next-jobs";

export default ScheduledJob("* * * * *", () => {
  console.log("");
});
