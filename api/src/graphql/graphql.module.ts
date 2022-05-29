import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { QueuesModule } from "src/graphql/queues/queues.module";

@Module({
  exports: [],
  imports: [QueuesModule, UsersModule],
  providers: [],
})
export class GraphqlModule {}
