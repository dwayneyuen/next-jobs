import { Module } from '@nestjs/common';
import { QueueJobService } from './queue-job.service';
import { QueueJobController } from './queue-job.controller';

@Module({
  controllers: [QueueJobController],
  providers: [QueueJobService],
})
export class QueueJobModule {}
