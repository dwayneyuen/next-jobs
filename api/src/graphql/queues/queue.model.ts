import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class QueueModel {
  @Field()
  name: string;

  @Field()
  path: string;
}
