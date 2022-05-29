import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class QueueModel {
  @Field()
  path: string;
}
