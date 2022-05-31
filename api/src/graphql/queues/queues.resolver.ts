import { Resolver } from "@nestjs/graphql";
import { QueueModel } from "src/graphql/queues/queue.model";

@Resolver(() => QueueModel)
export class QueuesResolver {}
