import { Body, Controller, Logger, Post } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

/**
 * Stripe webhook
 */
@Controller("stripe")
export class StripeController {
  constructor(private prismaService: PrismaService) {}

  private logger = new Logger(StripeController.name);

  @Post()
  async webhook(@Body() body: any): Promise<string> {
    return "hello world";
  }
}
