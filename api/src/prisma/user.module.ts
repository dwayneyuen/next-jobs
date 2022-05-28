import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { PrismaModule } from "./prisma.module";

@Module({
  exports: [UserService],
  imports: [PrismaModule],
  providers: [UserService],
})
export class UserModule {}
