import { Factory } from "fishery";
import { Plan } from "@dwayneyuen/next-cron-prisma";
import { v4 } from "uuid";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PlanFactory extends Factory<Plan> {
  constructor(private prismaService: PrismaService) {
    super(({ onCreate }) => {
      onCreate((plan) => this.prismaService.plan.create({ data: plan }));

      return {
        id: v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        jobLimit: 100,
        paypalPlanId: v4(),
      };
    });
  }
}
