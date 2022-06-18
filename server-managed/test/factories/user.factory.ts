import { Factory } from "fishery";
import { User } from "@dwayneyuen/next-cron-prisma";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { UserService } from "src/prisma/user.service";

@Injectable()
export class UserFactory extends Factory<User> {
  constructor(private userService: UserService) {
    super(({ onCreate }) => {
      onCreate((user) => this.userService.create(user));

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
