import { RepeatableJob } from "@dwayneyuen/next-jobs";

const RepeatableJobExample = RepeatableJob({ cron: "* * * * *" }, () => {
  console.log("");
});

export default RepeatableJobExample;
