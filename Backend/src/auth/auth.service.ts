import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { RegisterDistributorDto } from './dto/register-distributor.dto';
import { RegisterSalesmanDto } from './dto/register-salesman.dto';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(emailOrPhone: string, pass: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    if (!user.is_active) {
      throw new UnauthorizedException('Account deactivated');
    }

    if (user.approval_status !== 'APPROVED') {
      throw new UnauthorizedException('Account not approved');
    }

    return user;
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      approvalStatus: user.approval_status,
    };
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token (e.g. 7 days expiration)
    const refreshTokenPayload = { sub: user.id };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(user.id, {
      hashed_refresh_token: hashedRefreshToken,
      last_login_at: new Date(),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async registerDistributor(dto: RegisterDistributorDto) {
    const exists = await this.userRepo.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });
    if (exists)
      throw new BadRequestException('User with email or phone already exists');

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
        approval_status: 'PENDING_APPROVAL',
      };

      // using table name string if we don't import Distributor
      const insertResult = await queryRunner.manager.insert('distributors', distributorData);
      const distId = insertResult.identifiers[0].id;

      // Link to manufacturers
      if (dto.manufacturer_ids && dto.manufacturer_ids.length > 0) {
        const mfrDistLinks = dto.manufacturer_ids.map(id => ({
          manufacturer_id: id,
          distributor_id: distId,
          status: 'PENDING_APPROVAL',
        }));
        await queryRunner.manager.insert('manufacturer_distributors', mfrDistLinks);

        // Create Approval Requests
        const approvalRequests = dto.manufacturer_ids.map(id => ({
          request_type: 'DISTRIBUTOR_APPROVAL',
          requester_user_id: user.id,
          distributor_id: distId,
          manufacturer_id: id,
          status: 'PENDING_APPROVAL',
        }));
        await queryRunner.manager.insert('approval_requests', approvalRequests);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Distributor registered successfully. Pending approval.',
        userId: user.id,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async registerSalesman(dto: RegisterSalesmanDto) {
    const exists = await this.userRepo.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });
    if (exists)
      throw new BadRequestException('User with email or phone already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const queryRunner = this.userRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, {
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        password_hash: hashedPassword,
        role: 'SALESMAN',
        approval_status: 'PENDING_APPROVAL',
      });
      await queryRunner.manager.save(user);

      const salesmanData = {
        user_id: user.id,
        distributor_id: dto.distributor_id,
        full_name: dto.full_name,
        phone: dto.phone,
        email: dto.email,
        approval_status: 'PENDING_APPROVAL',
        is_active: false,
      };
      const insertResult = await queryRunner.manager.insert('salesmen', salesmanData);
      const salesmanId = insertResult.identifiers[0].id;

      await queryRunner.manager.insert('approval_requests', {
        request_type: 'SALESMAN_APPROVAL',
        requester_user_id: user.id,
        distributor_id: dto.distributor_id,
        salesman_id: salesmanId,
        status: 'PENDING_APPROVAL',
      });

      await queryRunner.commitTransaction();

      return {
        message: 'Salesman registered successfully. Pending approval.',
        userId: user.id,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });

      if (!user || !user.hashed_refresh_token) {
        throw new UnauthorizedException('Access Denied');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.hashed_refresh_token,
      );
      if (!refreshTokenMatches)
        throw new UnauthorizedException('Access Denied');

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

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    // Always return same message to prevent email enumeration
    const successMessage = {
      message: 'If an account exists, a password reset link has been sent.',
    };

    if (!user) return successMessage;

    // Generate 32-byte secure token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Token valid for 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() +
        parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINUTES || '15', 10),
    );

    await this.userRepo.update(user.id, {
      reset_password_token_hash: hashedToken,
      reset_password_expires_at: expiresAt,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.emailService.sendPasswordResetEmail(user.email, resetLink);

    return successMessage;
  }

  async validateResetToken(token: string) {
    if (!token) return { valid: false };

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepo.findOne({
      where: { reset_password_token_hash: hashedToken },
    });

    if (!user || !user.reset_password_expires_at) return { valid: false };

    if (user.reset_password_expires_at < new Date()) return { valid: false };

    return { valid: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    const user = await this.userRepo.findOne({
      where: { reset_password_token_hash: hashedToken },
    });

    if (
      !user ||
      !user.reset_password_expires_at ||
      user.reset_password_expires_at < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const newPasswordHash = await bcrypt.hash(dto.password, 10);

    await this.userRepo.update(user.id, {
      password_hash: newPasswordHash,
      reset_password_token_hash: null,
      reset_password_expires_at: null,
      hashed_refresh_token: null, // invalidate current sessions
    });

    // TODO: if AuditLogService is available in AuthService, log it here.
    // For now, doing it this way or we can just skip if it's not injected.

    return { message: 'Password reset successful.' };
  }
}
