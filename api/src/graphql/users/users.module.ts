import { Module } from "@nestjs/common";
import { UsersResolver } from "./users.resolver";
import { UserModule } from "src/prisma/user.module";

@Module({
  imports: [UserModule],
  providers: [UsersResolver],
})
export class UsersModule {}
