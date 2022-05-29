import { Injectable } from "@nestjs/common";
import { Prisma, Queue } from "@prisma/client";
import { PrismaService } from "./prisma.service";

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async queue(
    queueWhereUniqueInput: Prisma.QueueWhereUniqueInput,
  ): Promise<Queue | null> {
    return this.prisma.queue.findUnique({
      where: queueWhereUniqueInput,
    });
  }

  async queues(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.QueueWhereUniqueInput;
    where?: Prisma.QueueWhereInput;
    orderBy?: Prisma.QueueOrderByWithRelationInput;
  }): Promise<Queue[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.queue.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createQueue(data: Prisma.QueueCreateInput): Promise<Queue> {
    return this.prisma.queue.create({
      data,
    });
  }

  async updateQueue(params: {
    where: Prisma.QueueWhereUniqueInput;
    data: Prisma.QueueUpdateInput;
  }): Promise<Queue> {
    const { where, data } = params;
    return this.prisma.queue.update({
      data,
      where,
    });
  }

  async deleteQueue(where: Prisma.QueueWhereUniqueInput): Promise<Queue> {
    return this.prisma.queue.delete({
      where,
    });
  }
}
