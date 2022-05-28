import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "../../auth/gql-auth.guard";
import { User } from "./user.model";

@Resolver(() => User)
export class UsersResolver {
  @UseGuards(GqlAuthGuard)
  @Query(() => User, { nullable: true })
  async getMe() {
    return null;
  }
}
