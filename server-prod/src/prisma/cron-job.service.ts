import { Injectable } from "@nestjs/common";
import { CronJob, Prisma } from "@dwayneyuen/next-cron-prisma";
import { PrismaService } from "./prisma.service";

@Injectable()
export class CronJobService {
  constructor(private prisma: PrismaService) {}

  async cronJob(
    cronJobWhereUniqueInput: Prisma.CronJobWhereUniqueInput,
  ): Promise<CronJob | null> {
    return await this.prisma.cronJob.findUnique({
      where: cronJobWhereUniqueInput,
    });
  }

  async cronJobs(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CronJobWhereUniqueInput;
    where?: Prisma.CronJobWhereInput;
    orderBy?: Prisma.CronJobOrderByWithRelationInput;
  }): Promise<CronJob[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.cronJob.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createCronJob(data: Prisma.CronJobCreateInput): Promise<CronJob> {
    return await this.prisma.cronJob.create({
      data,
    });
  }

  async updateCronJob(params: {
    where: Prisma.CronJobWhereUniqueInput;
    data: Prisma.CronJobUpdateInput;
  }): Promise<CronJob> {
    const { where, data } = params;
    return this.prisma.cronJob.update({
      data,
      where,
    });
  }

  async deleteCronJob(where: Prisma.CronJobWhereUniqueInput): Promise<CronJob> {
    return this.prisma.cronJob.delete({
      where,
    });
  }
}
