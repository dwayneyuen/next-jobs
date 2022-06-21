import { MessageQueue } from "@dwayneyuen/next-cron";

const foo = {
  QueueExample: MessageQueue("object-queue", (job) => {
    console.log(job);
  }),
};

export default foo.QueueExample;
