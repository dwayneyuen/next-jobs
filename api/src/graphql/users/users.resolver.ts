import { Logger, UseGuards } from "@nestjs/common";
import {
  Args,
  Mutation,
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
import { PaypalClient } from "src/paypal/paypal-client";
import { SubscriptionStatus } from "src/paypal/enums";
import { PlanService } from "src/prisma/plan.service";

registerEnumType(SubscriptionStatus, { name: "SubscriptionStatus" });

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(
    private paypalClient: PaypalClient,
    private planService: PlanService,
    private userService: UserService,
  ) {}

  private logger = new Logger(UsersResolver.name);

  @ResolveField("subscriptionStatus", () => SubscriptionStatus, {
    nullable: true,
  })
  async subscriptionStatus(@Parent() user: UserModel) {
    if (!user.paypalSubscriptionId) {
      return null;
    }
    const subscriptionDetailsResponse =
      await this.paypalClient.getSubscriptionDetails({
        subscriptionId: user.paypalSubscriptionId,
      });
    return subscriptionDetailsResponse.status;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserModel, { nullable: true })
  async getMe(@CurrentSession() session: Auth0Session) {
    return await this.userService.user({ email: session.user.email });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserModel, { nullable: true })
  async savePaypalSubscription(
    @CurrentSession() session: Auth0Session,
    @Args("paypalPlanId") paypalPlanId: string,
    @Args("paypalSubscriptionId") paypalSubscriptionId: string,
  ) {
    this.logger.log(
      `email: ${session.user.email}, paypalPlan: ${paypalPlanId}, subscription: ${paypalSubscriptionId}`,
    );
    return await this.userService.updateUser({
      where: {
        email: session.user.email,
      },
      data: {
        paypalSubscriptionId,
        plan: { connect: { id: paypalPlanId } },
      },
    });
  }
}
