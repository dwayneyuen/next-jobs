import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { User } from "src/graphql/users/user.model";
import { GqlAuthGuard } from "src/auth/gql-auth.guard";
import { UserService } from "src/prisma/user.service";
import { Auth0Session } from "src/auth/authz.strategy";
import { CurrentSession } from "src/graphql/decorators/current-session";

@Resolver(() => User)
export class UsersResolver {
  constructor(private userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { nullable: true })
  async getMe(@CurrentSession() session: Auth0Session) {
    return this.userService.user({ email: session.user.email });
  }
}
