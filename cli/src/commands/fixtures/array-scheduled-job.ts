import { ScheduledJob } from "@dwayneyuen/next-jobs";

const foo = [
  ScheduledJob("* * * * *", () => {
    console.log("");
  }),
];

export default foo[0];
