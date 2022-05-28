import { Logger, UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard, Session } from "../../auth/gql-auth.guard";
import { UserService } from "../../prisma/user.service";
import { Session } from "../decorators/session";
import { User } from "./user.model";

@Resolver(() => User)
export class UsersResolver {
  constructor(private userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { nullable: true })
  async getMe(@Session() session: Session) {
    return this.userService.user({ email: session.user.email });
  }
}
