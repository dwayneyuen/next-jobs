import { Logger, UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard, Session } from "../../auth/gql-auth.guard";
import { UserService } from "../../prisma/user.service";
import { CurrentSession } from "../decorators/current-session";
import { User } from "./user.model";

@Resolver(() => User)
export class UsersResolver {
  constructor(private userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { nullable: true })
  async getMe(@CurrentSession() session: Session) {
    return this.userService.user({ email: session.user.email });
  }
}
