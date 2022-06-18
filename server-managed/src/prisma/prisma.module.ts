import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { UserService } from "src/prisma/user.service";
import { PlanService } from "src/prisma/plan.service";
import { CronJobService } from "src/prisma/cron-job.service";
import { MessageQueueService } from "src/prisma/message-queue.service";

@Module({
  exports: [
    CronJobService,
    MessageQueueService,
    PlanService,
    PrismaService,
    UserService,
  ],
  imports: [],
  providers: [
    CronJobService,
    MessageQueueService,
    PlanService,
    PrismaService,
    UserService,
  ],
})
export class PrismaModule {}
