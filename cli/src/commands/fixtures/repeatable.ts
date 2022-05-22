import { RepeatableJob } from "@dwayneyuen/next-jobs";

const RepeatableJobExample = RepeatableJob("* * * * *", () => {
  console.log("");
});

export default RepeatableJobExample;
