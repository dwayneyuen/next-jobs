import { RepeatableJob } from "@dwayneyuen/next-jobs";

const foo = [
  RepeatableJob({ cron: "* * * * *" }, () => {
    console.log("");
  }),
];

export default foo[0];
