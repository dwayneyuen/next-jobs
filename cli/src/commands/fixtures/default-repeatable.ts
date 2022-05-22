import { RepeatableJob } from "@dwayneyuen/next-jobs";

export default RepeatableJob("* * * * *", () => {
  console.log("");
});
