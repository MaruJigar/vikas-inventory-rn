import { Test, TestingModule } from '@nestjs/testing';
import { ManufacturerService } from './manufacturer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Manufacturer } from './manufacturer.entity';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ManufacturerService', () => {
  let service: ManufacturerService;

  const mockManufacturerRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManufacturerService,
        {
          provide: getRepositoryToken(Manufacturer),
          useValue: mockManufacturerRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ManufacturerService>(ManufacturerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProfile', () => {
    it('should create and save a new profile', async () => {
      mockManufacturerRepo.findOne.mockResolvedValue(null);
      mockManufacturerRepo.create.mockReturnValue({
        id: 'man1',
        company_name: 'TechCorp',
      });
      mockManufacturerRepo.save.mockImplementation(async (val) => val);

      const result = await service.createProfile('user1', {
        company_name: 'TechCorp',
      });
      expect(result.id).toBe('man1');
      expect(mockManufacturerRepo.save).toHaveBeenCalled();
    });
  });

  describe('linkDistributor', () => {
    it('should link distributor using transaction', async () => {
      const qr = mockDataSource.createQueryRunner();
      qr.manager.findOne
        .mockResolvedValueOnce({ id: 'man1' })
        .mockResolvedValueOnce({ id: 'dist1' });
      qr.manager.create.mockReturnValue({
        manufacturer_id: 'man1',
        distributor_id: 'dist1',
      });
      qr.manager.save.mockResolvedValue(true);

      const result = await service.linkDistributor('man1', 'dist1');
      expect(qr.startTransaction).toHaveBeenCalled();
      expect(qr.manager.save).toHaveBeenCalled();
      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
    });

    it('should throw NotFoundException if manufacturer or distributor missing', async () => {
      const qr = mockDataSource.createQueryRunner();
      qr.manager.findOne.mockResolvedValueOnce(null);

      await expect(service.linkDistributor('man1', 'dist1')).rejects.toThrow(
        NotFoundException,
      );
      expect(qr.rollbackTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
    });
  });
});
