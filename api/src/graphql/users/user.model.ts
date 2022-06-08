import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserModel {
  @Field()
  id: string;

  @Field({ nullable: true })
  baseUrl: string | null;

  @Field()
  email: string;

  @Field()
  accessToken: string;
}
