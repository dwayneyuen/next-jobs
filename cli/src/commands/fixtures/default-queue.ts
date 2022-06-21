import { MessageQueue } from "@dwayneyuen/next-cron";

export default MessageQueue("default-queue", (job) => {
  console.log(job);
});
