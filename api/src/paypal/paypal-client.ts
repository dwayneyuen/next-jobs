import { Inject, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { stringify } from "qs";
import { GenerateAccessTokenResponse } from "src/paypal/generate-access-token-response";
import { GetSubscriptionDetailsResponse } from "src/paypal/get-subscription-details-response";

@Injectable()
export class PaypalClient {
  constructor(
    @Inject("PAYPAL_AXIOS_INSTANCE") private paypalAxios: AxiosInstance,
  ) {}

  generateAccessToken = async (): Promise<GenerateAccessTokenResponse> => {
    const response = await this.paypalAxios.post<GenerateAccessTokenResponse>(
      "/oauth2/token",
      stringify({ grant_type: "client_credentials" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data;
  };

  getSubscriptionDetails = async ({
    subscriptionId,
  }: {
    subscriptionId: string;
  }): Promise<GetSubscriptionDetailsResponse> => {
    const accessToken = (await this.generateAccessToken()).access_token;
    const response = await this.paypalAxios.get<GetSubscriptionDetailsResponse>(
      `/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  };
}
