import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";

@Module({
  exports: [],
  imports: [UsersModule],
  providers: [],
})
export class GraphqlModule {}
