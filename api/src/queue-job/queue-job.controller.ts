import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QueueJobService } from './queue-job.service';
import { CreateQueueJobDto } from './dto/create-queue-job.dto';
import { UpdateQueueJobDto } from './dto/update-queue-job.dto';

@Controller('queue-job')
export class QueueJobController {
  constructor(private readonly queueJobService: QueueJobService) {}

  @Post()
  create(@Body() createQueueJobDto: CreateQueueJobDto) {
    return this.queueJobService.create(createQueueJobDto);
  }

  @Get()
  findAll() {
    return this.queueJobService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queueJobService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQueueJobDto: UpdateQueueJobDto,
  ) {
    return this.queueJobService.update(+id, updateQueueJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.queueJobService.remove(+id);
  }
}
