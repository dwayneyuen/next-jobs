import { Test, TestingModule } from '@nestjs/testing';
import { QueueJobController } from './queue-job.controller';
import { QueueJobService } from './queue-job.service';

describe('QueueJobController', () => {
  let controller: QueueJobController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueJobController],
      providers: [QueueJobService],
    }).compile();

    controller = module.get<QueueJobController>(QueueJobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
