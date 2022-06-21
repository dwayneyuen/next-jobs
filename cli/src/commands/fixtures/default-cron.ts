import { CronJob } from "@dwayneyuen/next-cron";

export default CronJob("* * * * *", () => {
  console.log("");
});
