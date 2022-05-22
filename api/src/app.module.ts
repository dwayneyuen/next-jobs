import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduledJobModule } from './scheduled-job/scheduled-job.module';
import { QueueJobModule } from './queue-job/queue-job.module';

@Module({
  imports: [ScheduledJobModule, QueueJobModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
