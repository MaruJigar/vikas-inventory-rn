import { Controller, Post, Body, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDistributorDto } from './dto/register-distributor.dto';
import { RegisterSalesmanDto } from './dto/register-salesman.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email_or_phone, dto.password);
    return this.authService.login(user);
  }

  @Post('register/distributor')
  async registerDistributor(@Body() dto: RegisterDistributorDto) {
    return this.authService.registerDistributor(dto);
  }

  @Post('register/salesman')
  async registerSalesman(@Body() dto: RegisterSalesmanDto) {
    return this.authService.registerSalesman(dto);
  }

  @Post('refresh')
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }
}
