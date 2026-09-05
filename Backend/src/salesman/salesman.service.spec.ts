import { Test, TestingModule } from '@nestjs/testing';
import { SalesmanService } from './salesman.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Salesman } from './salesman.entity';
import { User } from '../user/user.entity';
import { Distributor } from '../distributor/distributor.entity';
import { ApprovalRequest } from '../approval/approval-request.entity';
import { DataSource } from 'typeorm';

describe('SalesmanService', () => {
  let service: SalesmanService;
  let mockSalesmanRepo: any;
  let mockUserRepo: any;
  let mockDistributorRepo: any;
  let mockApprovalRepo: any;
  let mockDataSource: any;
  let mockQueryBuilder: any;
  let mockQueryRunner: any;

  const testSalesman = {
    id: 'salesman-1',
    user_id: 'user-salesman-1',
    distributor_id: 'distributor-1',
    is_active: false,
  };

  const testUser = {
    id: 'user-salesman-1',
    is_active: false,
  };

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(testSalesman),
    };

    mockSalesmanRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      save: jest.fn(),
    };

    mockUserRepo = {
      findOne: jest.fn(),
    };

    mockDistributorRepo = {
      findOne: jest.fn(),
    };

    mockApprovalRepo = {
      findOne: jest.fn(),
    };

    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        findOne: jest.fn().mockImplementation((entity, options) => {
          if (entity === User) {
            return Promise.resolve(testUser);
          }
          return Promise.resolve(null);
        }),
      },
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesmanService,
        { provide: getRepositoryToken(Salesman), useValue: mockSalesmanRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        {
          provide: getRepositoryToken(Distributor),
          useValue: mockDistributorRepo,
        },
        {
          provide: getRepositoryToken(ApprovalRequest),
          useValue: mockApprovalRepo,
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<SalesmanService>(SalesmanService);
  });

  it('should successfully update status of salesman and associated user', async () => {
    const result = await service.updateSalesmanStatus(
      'salesman-1',
      { is_active: true },
      'SUPER_ADMIN',
      'admin-id',
    );

    expect(result).toEqual({ message: 'Salesman status updated successfully' });
    expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
      Salesman,
      expect.objectContaining({ is_active: true }),
    );
    expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
      User,
      expect.objectContaining({ is_active: true }),
    );
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('should rollback transaction and throw error if save fails', async () => {
    mockQueryRunner.manager.save.mockRejectedValueOnce(new Error('DB Error'));

    await expect(
      service.updateSalesmanStatus(
        'salesman-1',
        { is_active: true },
        'SUPER_ADMIN',
        'admin-id',
      ),
    ).rejects.toThrow('DB Error');

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });
});
