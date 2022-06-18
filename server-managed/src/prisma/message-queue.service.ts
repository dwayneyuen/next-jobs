import { Injectable } from "@nestjs/common";
import { MessageQueue, Prisma } from "@dwayneyuen/next-cron-prisma";
import { PrismaService } from "./prisma.service";

@Injectable()
export class MessageQueueService {
  constructor(private prisma: PrismaService) {}

  async findFirst(
    messageQueueWhereInput: Prisma.MessageQueueWhereInput,
  ): Promise<MessageQueue | null> {
    return await this.prisma.messageQueue.findFirst({
      where: messageQueueWhereInput,
    });
  }

  async findUnique(
    messageQueueWhereUniqueInput: Prisma.MessageQueueWhereUniqueInput,
  ): Promise<MessageQueue | null> {
    return await this.prisma.messageQueue.findUnique({
      where: messageQueueWhereUniqueInput,
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.MessageQueueWhereUniqueInput;
    where?: Prisma.MessageQueueWhereInput;
    orderBy?: Prisma.MessageQueueOrderByWithRelationInput;
  }): Promise<MessageQueue[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.messageQueue.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(
    data:
      | Prisma.MessageQueueCreateInput
      | Prisma.MessageQueueUncheckedCreateInput,
  ): Promise<MessageQueue> {
    return await this.prisma.messageQueue.create({
      data,
    });
  }

  async createMany(
    data: Prisma.Enumerable<Prisma.MessageQueueCreateManyInput>,
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.messageQueue.createMany({
      data,
    });
  }

  async update(params: {
    where: Prisma.MessageQueueWhereUniqueInput;
    data: Prisma.MessageQueueUpdateInput;
  }): Promise<MessageQueue> {
    const { where, data } = params;
    return this.prisma.messageQueue.update({
      data,
      where,
    });
  }

  async delete(
    where: Prisma.MessageQueueWhereUniqueInput,
  ): Promise<MessageQueue> {
    return this.prisma.messageQueue.delete({
      where,
    });
  }

  async deleteMany(
    where: Prisma.MessageQueueWhereInput,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.messageQueue.deleteMany({
      where,
    });
  }
}
