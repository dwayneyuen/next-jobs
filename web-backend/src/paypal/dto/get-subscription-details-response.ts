import { SubscriptionStatus } from "src/paypal/enums";

export class GetSubscriptionDetailsResponse {
  plan_id: string;
  status: SubscriptionStatus;
}
