import { CronJob } from "@dwayneyuen/next-cron";

const CronJobExample = CronJob("* * * * *", () => {
  console.log("");
});

export default CronJobExample;
