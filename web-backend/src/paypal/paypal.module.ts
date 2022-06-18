import { Module } from "@nestjs/common";
import { config } from "dotenv";
import axios from "axios";
import { PaypalClient } from "src/paypal/paypal-client";

config();

@Module({
  exports: ["PAYPAL_AXIOS_INSTANCE"],
  providers: [
    {
      provide: "PAYPAL_AXIOS_INSTANCE",
      useValue: axios.create({
        baseURL: process.env.PAYPAL_BASE_URL,
        auth: {
          username: process.env.PAYPAL_CLIENT_ID,
          password: process.env.PAYPAL_SECRET,
        },
      }),
    },
    PaypalClient,
  ],
})
export class PaypalModule {}
