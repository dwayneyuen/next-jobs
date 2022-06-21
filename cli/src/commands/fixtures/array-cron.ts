import { CronJob } from "@dwayneyuen/next-cron";

const foo = [
  CronJob("* * * * *", () => {
    console.log("");
  }),
];

export default foo[0];
