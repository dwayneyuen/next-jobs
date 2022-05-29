import { Args, Field, Mutation, ObjectType, Resolver } from "@nestjs/graphql";
import { QueueModel } from "src/graphql/queues/queue.model";
import { QueueService } from "src/prisma/queue.service";
import { UserService } from "src/prisma/user.service";

@ObjectType()
class CreateQueueResponse {
  @Field()
  result: "success" | "invalid-token";
}

@Resolver(() => QueueModel)
export class QueuesResolver {
  constructor(
    private queueService: QueueService,
    private userService: UserService,
  ) {}

  @Mutation(() => CreateQueueResponse, { nullable: true })
  async createQueue(
    // TODO: Add guard for access token authentication
    @Args("accessToken") accessToken: string,
    @Args("name") name: string,
    @Args("path") path: string,
  ): Promise<CreateQueueResponse> {
    const user = await this.userService.user({
      accessToken,
    });
    if (!user) {
      return { result: "invalid-token" };
    }
    await this.queueService.createQueue({
      name,
      path,
      user: {
        connect: {
          id: user.id,
        },
      },
    });
    return { result: "success" };
  }
}
