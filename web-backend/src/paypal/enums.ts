export enum SubscriptionStatus {
  APPROVAL_PENDING = "APPROVAL_PENDING", // The subscription is created but not yet approved by the buyer.
  APPROVED = "APPROVED", // The buyer has approved the subscription.
  ACTIVE = "ACTIVE", // The subscription is active.
  SUSPENDED = "SUSPENDED", // The subscription is suspended.
  CANCELLED = "CANCELLED", // The subscription is cancelled.
  EXPIRED = "EXPIRED", // The subscription is expired.
}
