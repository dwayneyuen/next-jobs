export class PaypalWebhookBody {
  id: string;
  create_time: Date;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: any;
}
