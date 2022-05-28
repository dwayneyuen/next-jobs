import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Module({
  exports: [PrismaService],
  imports: [],
  providers: [PrismaService],
})
export class PrismaModule {}
