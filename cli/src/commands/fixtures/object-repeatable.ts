import { RepeatableJob } from "@dwayneyuen/next-jobs";

const foo = {
  RepeatableJobExample: RepeatableJob("* * * * *", () => {
    console.log("");
  }),
};

export default foo.RepeatableJobExample;
