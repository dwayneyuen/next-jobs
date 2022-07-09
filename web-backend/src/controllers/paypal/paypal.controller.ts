import { Body, Controller, Logger, Post } from "@nestjs/common";
import { PaypalWebhookBody } from "src/controllers/paypal/dto/PaypalWebhookBody";
import { PrismaService } from "src/prisma/prisma.service";

/**
 * Paypal webhook
 */
@Controller("paypal")
export class PaypalController {
  constructor(private prismaService: PrismaService) {}

  private logger = new Logger(PaypalController.name);

  @Post()
  async webhook(@Body() body: PaypalWebhookBody): Promise<string> {
    this.logger.log(
      `Paypal webhook body: id: ${body.id}, create_time: ${body.create_time}, resource_type: ${body.resource_type}, event_type: ${body.event_type}, summary: ${body.summary}`,
    );
    if (body.resource_type === "subscription") {
      const subscriptionId = body.resource.id;
      if (!subscriptionId) {
        this.logger.error("No subscription id found in message, exiting");
        return;
      }
      // TODO: Make column unique and use findUnique
      const user = await this.prismaService.user.findFirst({
        where: { paypalSubscriptionId: subscriptionId },
      });
      if (!user) {
        this.logger.error(
          `Could not find user with subscription id: ${subscriptionId}`,
        );
        return;
      }
    }
    return "hello world";
  }
}
