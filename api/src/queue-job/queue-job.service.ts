import { Injectable } from '@nestjs/common';
import { CreateQueueJobDto } from './dto/create-queue-job.dto';
import { UpdateQueueJobDto } from './dto/update-queue-job.dto';

@Injectable()
export class QueueJobService {
  create(createQueueJobDto: CreateQueueJobDto) {
    return 'This action adds a new queueJob';
  }

  findAll() {
    return `This action returns all queueJob`;
  }

  findOne(id: number) {
    return `This action returns a #${id} queueJob`;
  }

  update(id: number, updateQueueJobDto: UpdateQueueJobDto) {
    return `This action updates a #${id} queueJob`;
  }

  remove(id: number) {
    return `This action removes a #${id} queueJob`;
  }
}
