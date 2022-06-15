import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserModel {
  @Field()
  accessToken: string;

  @Field({ nullable: true })
  baseUrl: string | null;

  @Field()
  email: string;

  @Field()
  id: string;

  @Field({ nullable: true })
  paypalSubscriptionId: string;

  @Field({ nullable: true })
  paypalPlanId: string;
}
