import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { QueueService } from "src/prisma/queue.service";
import { UserService } from "src/prisma/user.service";

@Module({
  exports: [PrismaService, QueueService, UserService],
  imports: [],
  providers: [PrismaService, QueueService, UserService],
})
export class PrismaModule {}
