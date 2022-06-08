import { UseGuards } from "@nestjs/common";
import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { UserModel } from "src/graphql/users/user.model";
import { GqlAuthGuard } from "src/auth/gql-auth.guard";
import { UserService } from "src/prisma/user.service";
import { CurrentSession } from "src/graphql/decorators/current-session";
import { generateAccessToken } from "src/access-token";
import { Auth0Session } from "src/authz-session";

@ObjectType()
class CreateUserResponse {
  @Field()
  result: "success" | "email-taken" | "invalid-token";
}

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private userService: UserService) {}

  /**
   * Mutation for creating a user manually via the CLI
   *
   * Used for self-hosted deployments
   *
   * @param email
   * @param baseUrl
   * @param masterToken
   */
  @Mutation(() => CreateUserResponse, {
    nullable: true,
  })
  async createUser(
    @Args("email") email: string,
    @Args("baseUrl") baseUrl: string,
    // TODO: Use Authorization header and a guard
    @Args("masterToken") masterToken: string,
  ): Promise<CreateUserResponse> {
    if (
      !process.env.NEXT_JOBS_MASTER_TOKEN ||
      masterToken !== process.env.NEXT_JOBS_MASTER_TOKEN
    ) {
      return { result: "invalid-token" };
    }
    const exists = await this.userService.user({ email });
    if (exists) {
      return { result: "email-taken" };
    }
    const user = await this.userService.createUser({
      accessToken: generateAccessToken(),
      email,
      emailVerified: false,
      baseUrl,
    });
    if (user) {
      return { result: "success" };
    }
  }

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
