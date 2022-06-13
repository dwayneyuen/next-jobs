import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "src/auth/gql-auth.guard";
import { CurrentSession } from "src/graphql/decorators/current-session";
import { Auth0Session } from "src/auth/authz-session";
import { PaypalSubscriptionService } from "src/prisma/paypal-subscription.service";
import { UserService } from "src/prisma/user.service";
import { PaypalSubscriptionModel } from "src/graphql/paypal/paypal-subscription.model";

@Resolver()
export class PaypalSubscriptionResolver {
  constructor(
    private paypalSubscriptionService: PaypalSubscriptionService,
    private userService: UserService,
  ) {}

  /**
   * This only stores it in the database, it doesn't actually hit the PayPal API
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => PaypalSubscriptionModel, { nullable: true })
  async savePaypalSubscription(
    @CurrentSession() session: Auth0Session,
    @Args("planId") planId: string,
    @Args("subscriptionId") subscriptionId: string,
  ) {
    const user = await this.userService.user({ email: session.user.email });
    if (!user) {
      return;
    }
    return await this.paypalSubscriptionService.createPaypalSubscription({
      planId,
      subscriptionId,
      user: { connect: { id: user.id } },
    });
  }
}
