import { Test, TestingModule } from '@nestjs/testing';
import { QueueJobService } from './queue-job.service';

describe('QueueJobService', () => {
  let service: QueueJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueJobService],
    }).compile();

    service = module.get<QueueJobService>(QueueJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
