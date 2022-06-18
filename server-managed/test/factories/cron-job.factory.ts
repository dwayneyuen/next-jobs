import { Factory } from "fishery";
import { CronJob } from "@dwayneyuen/next-cron-prisma";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { CronJobService } from "src/prisma/cron-job.service";

@Injectable()
export class CronJobFactory extends Factory<CronJob> {
  constructor(private cronJobService: CronJobService) {
    super(({ onCreate }) => {
      onCreate((cronJob) => this.cronJobService.create(cronJob));

      return {
        id: v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        jobId: v4(),
        path: faker.random.alphaNumeric(),
        userId: v4(),
      };
    });
  }
}
