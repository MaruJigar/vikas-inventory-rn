import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { RegisterDistributorDto } from './dto/register-distributor.dto';
import { RegisterSalesmanDto } from './dto/register-salesman.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(emailOrPhone: string, pass: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: [
        { email: emailOrPhone },
        { phone: emailOrPhone },
      ],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    if (!user.is_active) throw new UnauthorizedException('Account deactivated');

    return user;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role, approvalStatus: user.approval_status };
    const accessToken = this.jwtService.sign(payload);
    
    // Generate refresh token (e.g. 7 days expiration)
    const refreshTokenPayload = { sub: user.id };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, { expiresIn: '7d' });
    
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(user.id, { 
      hashed_refresh_token: hashedRefreshToken,
      last_login_at: new Date()
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async registerDistributor(dto: RegisterDistributorDto) {
    const exists = await this.userRepo.findOne({ where: [{ email: dto.email }, { phone: dto.phone }] });
    if (exists) throw new BadRequestException('User with email or phone already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    // Auto-create distributor record inside transaction
    const queryRunner = this.userRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const user = queryRunner.manager.create(User, {
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        password_hash: hashedPassword,
        role: 'DISTRIBUTOR_ADMIN',
        approval_status: 'PENDING_APPROVAL',
      });
      await queryRunner.manager.save(user);

      // We need to import Distributor from its entity, but we can also use queryRunner manager directly if we pass string table name or we import it.
      // Let's assume we import Distributor at the top.
      const distributorData = {
        user_id: user.id,
        business_name: dto.business_name,
        owner_name: dto.full_name,
        phone: dto.phone,
        email: dto.email,
        gst_number: dto.gst_number || null,
        approval_status: 'PENDING_APPROVAL'
      };
      
      // using table name string if we don't import Distributor
      await queryRunner.manager.insert('distributors', distributorData);
      
      await queryRunner.commitTransaction();
      
      // TODO: Trigger approval request and notification via Background Jobs
      return { message: 'Distributor registered successfully. Pending approval.', userId: user.id };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async registerSalesman(dto: RegisterSalesmanDto) {
    const exists = await this.userRepo.findOne({ where: [{ email: dto.email }, { phone: dto.phone }] });
    if (exists) throw new BadRequestException('User with email or phone already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const user = this.userRepo.create({
      full_name: dto.full_name,
      email: dto.email,
      phone: dto.phone,
      password_hash: hashedPassword,
      role: 'SALESMAN',
      approval_status: 'PENDING_APPROVAL',
    });
    
    await this.userRepo.save(user);
    // TODO: Create salesman link to distributor
    return { message: 'Salesman registered successfully. Pending approval.', userId: user.id };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      
      if (!user || !user.hashed_refresh_token) {
        throw new UnauthorizedException('Access Denied');
      }

      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.hashed_refresh_token);
      if (!refreshTokenMatches) throw new UnauthorizedException('Access Denied');

      return this.login(user); // generates new pair
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, { hashed_refresh_token: null });
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { password_hash, hashed_refresh_token, ...result } = user;
    return result;
  }
}
