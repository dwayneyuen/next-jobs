import { Module } from "@nestjs/common";
import { UserModule } from "../../prisma/user.module";
import { UsersResolver } from "./users.resolver";

@Module({
  imports: [UserModule],
  providers: [UsersResolver],
})
export class UsersModule {}
