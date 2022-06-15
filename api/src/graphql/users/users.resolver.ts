import { Logger, UseGuards } from "@nestjs/common";
import {
  Parent,
  Query,
  registerEnumType,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { UserModel } from "src/graphql/users/user.model";
import { GqlAuthGuard } from "src/auth/gql-auth.guard";
import { UserService } from "src/prisma/user.service";
import { CurrentSession } from "src/graphql/decorators/current-session";
import { Auth0Session } from "src/auth/authz-session";
import { PaypalSubscriptionService } from "src/prisma/paypal-subscription.service";
import { PaypalClient } from "src/paypal/paypal-client";
import { SubscriptionStatus } from "src/paypal/get-subscription-details-response";

registerEnumType(SubscriptionStatus, { name: "SubscriptionStatus" });

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(
    private paypalClient: PaypalClient,
    private paypalSubscriptionService: PaypalSubscriptionService,
    private userService: UserService,
  ) {}

  private logger = new Logger(UsersResolver.name);

  @ResolveField("subscriptionStatus", () => SubscriptionStatus, {
    nullable: true,
  })
  async subscriptionStatus(@Parent() user: UserModel) {
    this.logger.log("fetching subscription status...");
    const paypalSubscriptions =
      await this.paypalSubscriptionService.paypalSubscriptions({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      });
    this.logger.log(`subscriptions length: ${paypalSubscriptions.length}`);
    if (paypalSubscriptions.length === 0) {
      return null;
    }
    this.logger.log(`subscriptions length: ${paypalSubscriptions.length}`);
    const subscriptionDetailsResponse =
      await this.paypalClient.getSubscriptionDetails({
        subscriptionId: paypalSubscriptions[0].subscriptionId,
      });
    this.logger.log(`response: ${JSON.stringify(subscriptionDetailsResponse)}`);
    return subscriptionDetailsResponse.status;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserModel, { nullable: true })
  async getMe(@CurrentSession() session: Auth0Session) {
    return await this.userService.user({ email: session.user.email });
  }

  @Query(() => Boolean)
  async paypal() {
    // await this.paypalClient.generateAccessToken();
    await this.paypalClient.getSubscriptionDetails({
      subscriptionId: "I-0DCYDL1MV09Y",
    });
    return true;
  }
}
