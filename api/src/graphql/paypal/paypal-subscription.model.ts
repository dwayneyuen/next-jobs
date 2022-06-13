import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PaypalSubscriptionModel {
  @Field()
  id: string;

  @Field()
  planId: string;

  @Field()
  subscriptionId: string;
}
