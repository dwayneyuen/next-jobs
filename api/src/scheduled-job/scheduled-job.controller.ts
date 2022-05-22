import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ScheduledJobService } from './scheduled-job.service';
import { CreateScheduledJobDto } from './dto/create-scheduled-job.dto';
import { UpdateScheduledJobDto } from './dto/update-scheduled-job.dto';

@Controller('scheduled-job')
export class ScheduledJobController {
  constructor(private readonly scheduledJobService: ScheduledJobService) {}

  @Post()
  create(@Body() createScheduledJobDto: CreateScheduledJobDto) {
    return this.scheduledJobService.create(createScheduledJobDto);
  }

  @Get()
  findAll() {
    return this.scheduledJobService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduledJobService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduledJobDto: UpdateScheduledJobDto,
  ) {
    return this.scheduledJobService.update(+id, updateScheduledJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduledJobService.remove(+id);
  }
}
