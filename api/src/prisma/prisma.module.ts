import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { UserService } from "src/prisma/user.service";

@Module({
  exports: [PrismaService, UserService],
  imports: [],
  providers: [PrismaService, UserService],
})
export class PrismaModule {}
