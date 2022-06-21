import { MessageQueue } from "@dwayneyuen/next-cron";

const foo = [
  MessageQueue("array-queue", (job) => {
    console.log(job);
  }),
];

export default foo[0];
