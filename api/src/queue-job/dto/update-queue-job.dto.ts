import { PartialType } from '@nestjs/mapped-types';
import { CreateQueueJobDto } from './create-queue-job.dto';

export class UpdateQueueJobDto extends PartialType(CreateQueueJobDto) {}
