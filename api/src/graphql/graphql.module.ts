import { Module } from "@nestjs/common";
import { UsersResolver } from "src/graphql/users/users.resolver";
import { PrismaModule } from "src/prisma/prisma.module";
import { PaypalSubscriptionResolver } from "src/graphql/paypal/paypal-subscription.resolver";
import { PaypalModule } from "src/paypal/paypal.module";
import { PaypalClient } from "src/paypal/paypal-client";

@Module({
  exports: [],
  imports: [PaypalModule, PrismaModule],
  providers: [PaypalClient, PaypalSubscriptionResolver, UsersResolver],
})
export class GraphqlModule {}
