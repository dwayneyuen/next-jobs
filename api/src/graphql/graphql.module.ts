import { Module } from "@nestjs/common";
import { QueuesResolver } from "src/graphql/queues/queues.resolver";
import { UsersResolver } from "src/graphql/users/users.resolver";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  exports: [],
  imports: [PrismaModule],
  providers: [QueuesResolver, UsersResolver],
})
export class GraphqlModule {}
