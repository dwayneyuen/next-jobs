import { Injectable } from "@nestjs/common";
import { MessageQueue, Prisma } from "@dwayneyuen/next-cron-prisma";
import { PrismaService } from "./prisma.service";

@Injectable()
export class MessageQueueService {
  constructor(private prisma: PrismaService) {}

  async messageQueue(
    messageQueueWhereUniqueInput: Prisma.MessageQueueWhereUniqueInput,
  ): Promise<MessageQueue | null> {
    return await this.prisma.messageQueue.findUnique({
      where: messageQueueWhereUniqueInput,
    });
  }

  async messageQueues(params: {
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

  async createMessageQueue(
    data: Prisma.MessageQueueCreateInput,
  ): Promise<MessageQueue> {
    return await this.prisma.messageQueue.create({
      data,
    });
  }

  async updateMessageQueue(params: {
    where: Prisma.MessageQueueWhereUniqueInput;
    data: Prisma.MessageQueueUpdateInput;
  }): Promise<MessageQueue> {
    const { where, data } = params;
    return this.prisma.messageQueue.update({
      data,
      where,
    });
  }

  async deleteMessageQueue(
    where: Prisma.MessageQueueWhereUniqueInput,
  ): Promise<MessageQueue> {
    return this.prisma.messageQueue.delete({
      where,
    });
  }
}
