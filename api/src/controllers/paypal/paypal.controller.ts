import { Controller, Logger, Post, Req } from "@nestjs/common";
import { Request } from "express";

/**
 * Paypal webhook
 */
@Controller("paypal")
export class PaypalController {
  private logger = new Logger(PaypalController.name);

  @Post()
  webhook(@Req() request: Request): string {
    this.logger.log(`Request body: ${request.body}`);
    return "hello world";
  }
}
