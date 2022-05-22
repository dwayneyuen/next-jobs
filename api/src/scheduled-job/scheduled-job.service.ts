import { Injectable } from '@nestjs/common';
import { CreateScheduledJobDto } from './dto/create-scheduled-job.dto';
import { UpdateScheduledJobDto } from './dto/update-scheduled-job.dto';

@Injectable()
export class ScheduledJobService {
  create(createScheduledJobDto: CreateScheduledJobDto) {
    return 'This action adds a new scheduledJob';
  }

  findAll() {
    return `This action returns all scheduledJob`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scheduledJob`;
  }

  update(id: number, updateScheduledJobDto: UpdateScheduledJobDto) {
    return `This action updates a #${id} scheduledJob`;
  }

  remove(id: number) {
    return `This action removes a #${id} scheduledJob`;
  }
}
