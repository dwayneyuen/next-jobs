import { RepeatableJob } from "@dwayneyuen/next-jobs";

const foo = [
  RepeatableJob("* * * * *", () => {
    console.log("");
  }),
];

export default foo[0];
