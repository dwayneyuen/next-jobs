import { Module } from "@nestjs/common";
import { QueuesResolver } from "src/graphql/queues/queues.resolver";
import { QueueModule } from "src/prisma/queue.module";
import { UserModule } from "src/prisma/user.module";

@Module({
  imports: [QueueModule, UserModule],
  providers: [QueuesResolver],
})
export class QueuesModule {}
