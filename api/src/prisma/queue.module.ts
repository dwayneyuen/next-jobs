import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma.module";
import { QueueService } from "src/prisma/queue.service";

@Module({
  exports: [QueueService],
  imports: [PrismaModule],
  providers: [QueueService],
})
export class QueueModule {}
