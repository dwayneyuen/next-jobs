import { Module } from "@nestjs/common";
import { UsersResolver } from "src/graphql/users/users.resolver";
import { PrismaModule } from "src/prisma/prisma.module";
import { PaypalSubscriptionResolver } from "src/graphql/paypal/paypal-subscription.resolver";

@Module({
  exports: [],
  imports: [PrismaModule],
  providers: [PaypalSubscriptionResolver, UsersResolver],
})
export class GraphqlModule {}
