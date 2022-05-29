import { Injectable } from "@nestjs/common";
import { Prisma, ScheduledJob } from "@prisma/client";
import { PrismaService } from "./prisma.service";

@Injectable()
export class ScheduledJobService {
  constructor(private prisma: PrismaService) {}

  async scheduledJob(
    scheduledJobWhereUniqueInput: Prisma.ScheduledJobWhereUniqueInput,
  ): Promise<ScheduledJob | null> {
    return this.prisma.scheduledJob.findUnique({
      where: scheduledJobWhereUniqueInput,
    });
  }

  async scheduledJobs(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ScheduledJobWhereUniqueInput;
    where?: Prisma.ScheduledJobWhereInput;
    orderBy?: Prisma.ScheduledJobOrderByWithRelationInput;
  }): Promise<ScheduledJob[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.scheduledJob.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createScheduledJob(
    data: Prisma.ScheduledJobCreateInput,
  ): Promise<ScheduledJob> {
    return this.prisma.scheduledJob.create({
      data,
    });
  }

  async updateScheduledJob(params: {
    where: Prisma.ScheduledJobWhereUniqueInput;
    data: Prisma.ScheduledJobUpdateInput;
  }): Promise<ScheduledJob> {
    const { where, data } = params;
    return this.prisma.scheduledJob.update({
      data,
      where,
    });
  }

  async deleteScheduledJob(
    where: Prisma.ScheduledJobWhereUniqueInput,
  ): Promise<ScheduledJob> {
    return this.prisma.scheduledJob.delete({
      where,
    });
  }
}
