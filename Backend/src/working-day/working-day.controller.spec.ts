import { Test, TestingModule } from '@nestjs/testing';
import { WorkingDayController } from './working-day.controller';
import { WorkingDayService } from './working-day.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';

const mockWorkingDayService = {
  checkIn: jest.fn(),
  checkOut: jest.fn(),
  getHistory: jest.fn(),
};

describe('WorkingDayController', () => {
  let controller: WorkingDayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkingDayController],
      providers: [
        { provide: WorkingDayService, useValue: mockWorkingDayService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkingDayController>(WorkingDayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkIn', () => {
    it('should call service checkIn', async () => {
      const dto: CheckInDto = { latitude: 10, longitude: 20 };
      mockWorkingDayService.checkIn.mockResolvedValue({ id: 'wd1' });

      const req = { user: { userId: 'u1' } };
      const res = await controller.checkIn(dto, req);

      expect(res).toEqual({ id: 'wd1' });
      expect(mockWorkingDayService.checkIn).toHaveBeenCalledWith('u1', dto);
    });
  });

  describe('checkOut', () => {
    it('should call service checkOut', async () => {
      const dto: CheckOutDto = { latitude: 10, longitude: 20 };
      mockWorkingDayService.checkOut.mockResolvedValue({ id: 'wd1' });

      const req = { user: { userId: 'u1' } };
      const res = await controller.checkOut(dto, req);

      expect(res).toEqual({ id: 'wd1' });
      expect(mockWorkingDayService.checkOut).toHaveBeenCalledWith('u1', dto);
    });
  });

  describe('getHistory', () => {
    it('should call service getHistory', async () => {
      mockWorkingDayService.getHistory.mockResolvedValue([{ id: 'wd1' }]);

      const req = { user: { userId: 'u1', role: 'SALESMAN' } };
      const res = await controller.getHistory(req);

      expect(res).toEqual([{ id: 'wd1' }]);
      expect(mockWorkingDayService.getHistory).toHaveBeenCalledWith(
        'u1',
        'SALESMAN',
        [],
      );
    });
  });
});
