import { RepeatableJob } from "@dwayneyuen/next-jobs";

const foo = {
  RepeatableJobExample: RepeatableJob({ cron: "* * * * *" }, () => {
    console.log("");
  }),
};

export default foo.RepeatableJobExample;
