import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { EmailService } from '../email/email.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    manager: {
      connection: {
        createQueryRunner: jest.fn().mockReturnValue({
          connect: jest.fn(),
          startTransaction: jest.fn(),
          commitTransaction: jest.fn(),
          rollbackTransaction: jest.fn(),
          release: jest.fn(),
          manager: {
            create: jest.fn().mockReturnValue({ id: 'user123' }),
            save: jest.fn(),
            insert: jest.fn().mockResolvedValue({ identifiers: [{ id: 'dist123' }] }),
          },
        }),
      },
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_token'),
    verify: jest.fn(),
  };

  const mockEmailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate and return user if credentials match', async () => {
      const mockUser = { id: '1', password_hash: 'hashed', is_active: true, approval_status: 'APPROVED' };
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@test.com', 'password');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if wrong password', async () => {
      const mockUser = { id: '1', password_hash: 'hashed', is_active: true };
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('test', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        role: 'SALESMAN',
        approval_status: 'APPROVED',
      } as User;
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_refresh');

      const result = await service.login(mockUser);
      expect(result.access_token).toBe('mock_token');
      expect(result.refresh_token).toBe('mock_token');
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ hashed_refresh_token: 'hashed_refresh' }),
      );
    });
  });

  describe('registerDistributor', () => {
    it('should execute transaction to create User and Distributor', async () => {
      mockUserRepo.findOne.mockResolvedValue(null); // No existing user
      const dto = {
        full_name: 'John',
        email: 'j@j.com',
        phone: '123',
        password: 'pass',
        business_name: 'Biz',
        manufacturer_ids: ['manufacturer-id'],
      };

      const result = await service.registerDistributor(dto);
      expect(result.message).toContain('Distributor registered successfully');

      // Check query runner was used
      const qr = mockUserRepo.manager.connection.createQueryRunner();
      expect(qr.connect).toHaveBeenCalled();
      expect(qr.startTransaction).toHaveBeenCalled();
      expect(qr.manager.save).toHaveBeenCalled();
      expect(qr.manager.insert).toHaveBeenCalledWith(
        'distributors',
        expect.any(Object),
      );
      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
    });
  });
});
