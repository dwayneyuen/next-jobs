import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { UserModel } from "src/graphql/users/user.model";
import { GqlAuthGuard } from "src/auth/gql-auth.guard";
import { UserService } from "src/prisma/user.service";
import { CurrentSession } from "src/graphql/decorators/current-session";
import { Auth0Session } from "src/auth/authz-session";

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private userService: UserService) {}

  @Query(() => UserModel, { nullable: true })
  async getUserByAccessToken(@Args("accessToken") accessToken: string) {
    return this.userService.user({ accessToken });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserModel, { nullable: true })
  async getMe(@CurrentSession() session: Auth0Session) {
    return this.userService.user({ email: session.user.email });
  }
}
