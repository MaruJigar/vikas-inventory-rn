import { Test, TestingModule } from '@nestjs/testing';
import { VisitController } from './visit.controller';
import { VisitService } from './visit.service';

describe('VisitController', () => {
  let controller: VisitController;

  const mockVisitService = {
    startVisit: jest.fn().mockResolvedValue({ id: 'v1' }),
    endVisit: jest.fn().mockResolvedValue({ id: 'v1', status: 'CLOSED' }),
    noOrderVisit: jest.fn().mockResolvedValue({ id: 'v1', status: 'CLOSED' }),
    getVisits: jest.fn().mockResolvedValue([{ id: 'v1' }]),
    getVisitById: jest.fn().mockResolvedValue({ id: 'v1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitController],
      providers: [
        { provide: VisitService, useValue: mockVisitService },
      ],
    }).compile();

    controller = module.get<VisitController>(VisitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('startVisit', () => {
    expect(controller.startVisit({ user: { userId: 'u1' } }, { shopId: 'shop1' })).resolves.toBeDefined();
  });

  it('endVisit', () => {
    expect(controller.endVisit({ user: { userId: 'u1' } }, { visitId: 'v1' })).resolves.toBeDefined();
  });

  it('noOrderVisit', () => {
    expect(controller.noOrderVisit({ user: { userId: 'u1' } }, { visitId: 'v1', reason: 'reason' })).resolves.toBeDefined();
  });

  it('getVisits', () => {
    expect(controller.getVisits({ user: { userId: 'u1', role: 'SALESMAN' } })).resolves.toBeDefined();
  });

  it('getVisitById', () => {
    expect(controller.getVisitById({ user: { userId: 'u1', role: 'SALESMAN' } }, 'v1')).resolves.toBeDefined();
  });
});
