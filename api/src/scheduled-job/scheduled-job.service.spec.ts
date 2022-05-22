import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledJobService } from './scheduled-job.service';

describe('ScheduledJobService', () => {
  let service: ScheduledJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduledJobService],
    }).compile();

    service = module.get<ScheduledJobService>(ScheduledJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
