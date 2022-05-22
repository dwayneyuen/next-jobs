import { Module } from '@nestjs/common';
import { ScheduledJobService } from './scheduled-job.service';
import { ScheduledJobController } from './scheduled-job.controller';

@Module({
  controllers: [ScheduledJobController],
  providers: [ScheduledJobService],
})
export class ScheduledJobModule {}
