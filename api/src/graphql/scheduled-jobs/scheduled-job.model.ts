import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ScheduledJobModel {
  @Field()
  name: string;

  @Field()
  path: string;

  @Field()
  schedule: string;
}
