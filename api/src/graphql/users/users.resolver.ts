import { Args, Query, Resolver } from "@nestjs/graphql";
import { User } from "./user.model";
import { PrismaClient } from "@prisma/client";
import { Logger, UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "../../authz/GqlAuthGuard";

@Resolver(() => User)
export class UsersResolver {
  @Query(() => User, { nullable: true })
  async getUser(@Args("email") email: string) {
    Logger.log("got here to get user");
    const prisma = new PrismaClient();
    return await prisma.user.findUnique({ where: { email } });
  }

  @Query(() => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async setUser(@Args("email") email: string) {
    Logger.log("got here to get user");
    const prisma = new PrismaClient();
    return await prisma.user.findUnique({ where: { email } });
  }
}
