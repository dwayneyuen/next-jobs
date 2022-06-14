import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { UserService } from "src/prisma/user.service";
import { PaypalSubscriptionService } from "src/prisma/paypal-subscription.service";

@Module({
  exports: [PaypalSubscriptionService, PrismaService, UserService],
  imports: [],
  providers: [PaypalSubscriptionService, PrismaService, UserService],
})
export class PrismaModule {}
