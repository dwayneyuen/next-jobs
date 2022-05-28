import { Module } from "@nestjs/common";
import { UserModule } from "../prisma/user.module";
import { UsersModule } from "./users/users.module";

@Module({
  exports: [],
  imports: [UsersModule, UserModule],
  providers: [],
})
export class GraphqlModule {}
