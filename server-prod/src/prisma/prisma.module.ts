import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { UserService } from "src/prisma/user.service";
import { PlanService } from "src/prisma/plan.service";

@Module({
  exports: [PlanService, PrismaService, UserService],
  imports: [],
  providers: [PlanService, PrismaService, UserService],
})
export class PrismaModule {}
