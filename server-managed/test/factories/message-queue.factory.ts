import { Factory } from "fishery";
import { MessageQueue } from "@dwayneyuen/next-cron-prisma";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { MessageQueueService } from "src/prisma/message-queue.service";

@Injectable()
export class MessageQueueFactory extends Factory<MessageQueue> {
  constructor(private messageQueueService: MessageQueueService) {
    super(({ onCreate }) => {
      onCreate((messageQueue) => this.messageQueueService.create(messageQueue));

      return {
        id: v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: faker.random.alphaNumeric(),
        path: faker.random.alphaNumeric(),
        userId: v4(),
      };
    });
  }
}
