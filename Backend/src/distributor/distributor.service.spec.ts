import { Test, TestingModule } from '@nestjs/testing';
import { DistributorService } from './distributor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Distributor } from './distributor.entity';
import { NotFoundException } from '@nestjs/common';

describe('DistributorService', () => {
  let service: DistributorService;

  const mockDistributorRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributorService,
        {
          provide: getRepositoryToken(Distributor),
          useValue: mockDistributorRepo,
        },
      ],
    }).compile();

    service = module.get<DistributorService>(DistributorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the distributor profile if found', async () => {
      const mockProfile = { id: 'dist1', user_id: 'user1', business_name: 'Biz' };
      mockDistributorRepo.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfile('user1');
      expect(result).toEqual(mockProfile);
      expect(mockDistributorRepo.findOne).toHaveBeenCalledWith({ where: { user_id: 'user1' } });
    });

    it('should throw NotFoundException if not found', async () => {
      mockDistributorRepo.findOne.mockResolvedValue(null);
      await expect(service.getProfile('user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should merge dto and save profile', async () => {
      const mockProfile = { id: 'dist1', user_id: 'user1', business_name: 'Biz' };
      mockDistributorRepo.findOne.mockResolvedValue(mockProfile);
      mockDistributorRepo.save.mockImplementation(async (val) => val);

      const result = await service.updateProfile('user1', { business_name: 'New Biz', city: 'Delhi' });
      expect(result.business_name).toBe('New Biz');
      expect(result.city).toBe('Delhi');
      expect(mockDistributorRepo.save).toHaveBeenCalled();
    });
  });
});
