import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledJobController } from './scheduled-job.controller';
import { ScheduledJobService } from './scheduled-job.service';

describe('ScheduledJobController', () => {
  let controller: ScheduledJobController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduledJobController],
      providers: [ScheduledJobService],
    }).compile();

    controller = module.get<ScheduledJobController>(ScheduledJobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
