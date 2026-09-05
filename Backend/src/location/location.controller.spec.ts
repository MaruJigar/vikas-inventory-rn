import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

describe('LocationController', () => {
  let controller: LocationController;
  let service: LocationService;

  const mockLocationService = {
    uploadLocation: jest.fn(),
    batchUploadLocations: jest.fn(),
    getLiveLocation: jest.fn(),
    getLocationHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [{ provide: LocationService, useValue: mockLocationService }],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);
  });

  it('uploadLocation', async () => {
    const dto = {
      latitude: 10,
      longitude: 20,
      captured_at: new Date().toISOString(),
    };
    const req = { user: { userId: 'u1' } };
    await controller.uploadLocation(req, dto);
    expect(service.uploadLocation).toHaveBeenCalledWith('u1', dto);
  });

  it('batchUploadLocations', async () => {
    const dto = { locations: [] };
    const req = { user: { userId: 'u1' } };
    await controller.batchUploadLocations(req, dto);
    expect(service.batchUploadLocations).toHaveBeenCalledWith('u1', dto);
  });

  it('getLiveLocation', async () => {
    const req = { user: { userId: 'u1', role: 'DISTRIBUTOR_ADMIN' } };
    await controller.getLiveLocation(req, 's1');
    expect(service.getLiveLocation).toHaveBeenCalledWith(
      'u1',
      'DISTRIBUTOR_ADMIN',
      's1',
    );
  });

  it('getLocationHistory', async () => {
    const req = { user: { userId: 'u1', role: 'DISTRIBUTOR_ADMIN' } };
    await controller.getLocationHistory(req, 's1');
    expect(service.getLocationHistory).toHaveBeenCalledWith(
      'u1',
      'DISTRIBUTOR_ADMIN',
      's1',
    );
  });
});
