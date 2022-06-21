import { CronJob } from "@dwayneyuen/next-cron";

const foo = {
  CronJobExample: CronJob("* * * * *", () => {
    console.log("");
  }),
};

export default foo.CronJobExample;
