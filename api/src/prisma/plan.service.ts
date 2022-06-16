import { Injectable } from "@nestjs/common";
import { Prisma, Plan } from "@prisma/client";
import { PrismaService } from "./prisma.service";

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  async plan(
    planWhereUniqueInput: Prisma.PlanWhereUniqueInput,
  ): Promise<Plan | null> {
    return await this.prisma.plan.findUnique({
      where: planWhereUniqueInput,
    });
  }

  async plans(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PlanWhereUniqueInput;
    where?: Prisma.PlanWhereInput;
    orderBy?: Prisma.PlanOrderByWithRelationInput;
  }): Promise<Plan[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.plan.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPlan(data: Prisma.PlanCreateInput): Promise<Plan> {
    return await this.prisma.plan.create({
      data,
    });
  }

  async updatePlan(params: {
    where: Prisma.PlanWhereUniqueInput;
    data: Prisma.PlanUpdateInput;
  }): Promise<Plan> {
    const { where, data } = params;
    return this.prisma.plan.update({
      data,
      where,
    });
  }

  async deletePlan(where: Prisma.PlanWhereUniqueInput): Promise<Plan> {
    return this.prisma.plan.delete({
      where,
    });
  }
}
