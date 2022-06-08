import { ScheduledJob } from "@dwayneyuen/next-jobs";

const foo = {
  ScheduledJobExample: ScheduledJob("* * * * *", () => {
    console.log("");
  }),
};

export default foo.ScheduledJobExample;
