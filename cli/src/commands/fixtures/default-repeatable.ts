import { RepeatableJob } from "@dwayneyuen/next-jobs";

export default RepeatableJob({ cron: "* * * * *" }, () => {
  console.log("");
});
