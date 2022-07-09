import { Factory } from "fishery";
import { User } from "@dwayneyuen/next-cron-prisma";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserFactory extends Factory<User> {
  constructor(private prismaService: PrismaService) {
    super(({ onCreate }) => {
      onCreate((user) => this.prismaService.user.create({ data: user }));

      return {
        id: v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        authzSub: v4(),
        accessToken: v4(),
        baseUrl: null,
        email: faker.internet.email(),
        emailVerified: true,
        jobsRemaining: null,
        paypalSubscriptionId: null,
        paypalSubscriptionStatus: null,
        planId: null,
      };
    });
  }
}
