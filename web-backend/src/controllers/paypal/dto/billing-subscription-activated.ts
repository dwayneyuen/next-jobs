import { SubscriptionStatus } from "src/paypal/enums";

class BillingSubscriptionActivated {
  id: string;
  create_time: Date;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: {
    id: string;
    plan_id: string;
    auto_renewal: boolean;
    status: SubscriptionStatus;
  };
}
