import { Injectable } from "@nestjs/common";
import { PaypalSubscription, Prisma } from "@prisma/client";
import { PrismaService } from "./prisma.service";

@Injectable()
export class PaypalSubscriptionService {
  constructor(private prisma: PrismaService) {}

  async paypalSubscription(
    paypalSubscriptionWhereUniqueInput: Prisma.PaypalSubscriptionWhereUniqueInput,
  ): Promise<PaypalSubscription | null> {
    return this.prisma.paypalSubscription.findUnique({
      where: paypalSubscriptionWhereUniqueInput,
    });
  }

  async paypalSubscriptions(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PaypalSubscriptionWhereUniqueInput;
    where?: Prisma.PaypalSubscriptionWhereInput;
    orderBy?: Prisma.PaypalSubscriptionOrderByWithRelationInput;
  }): Promise<PaypalSubscription[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.paypalSubscription.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPaypalSubscription(
    data: Prisma.PaypalSubscriptionCreateInput,
  ): Promise<PaypalSubscription> {
    return this.prisma.paypalSubscription.create({
      data,
    });
  }

  async updatePaypalSubscription(params: {
    where: Prisma.PaypalSubscriptionWhereUniqueInput;
    data: Prisma.PaypalSubscriptionUpdateInput;
  }): Promise<PaypalSubscription> {
    const { where, data } = params;
    return this.prisma.paypalSubscription.update({
      data,
      where,
    });
  }

  async deletePaypalSubscription(
    where: Prisma.PaypalSubscriptionWhereUniqueInput,
  ): Promise<PaypalSubscription> {
    return this.prisma.paypalSubscription.delete({
      where,
    });
  }
}
