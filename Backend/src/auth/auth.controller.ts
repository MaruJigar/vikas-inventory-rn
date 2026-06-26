import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDistributorDto } from './dto/register-distributor.dto';
import { RegisterSalesmanDto } from './dto/register-salesman.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Login',
    description:
      'Authenticate user with email or phone and password. Returns JWT tokens.',
  })
  @ApiOkResponse({ description: 'Successfully authenticated.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(
      dto.email_or_phone,
      dto.password,
    );
    return this.authService.login(user);
  }

  @ApiOperation({
    summary: 'Register Distributor',
    description: 'Creates a pending registration request for a Distributor.',
  })
  @ApiCreatedResponse({ description: 'Registration request created.' })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @Post('register/distributor')
  async registerDistributor(@Body() dto: RegisterDistributorDto) {
    return this.authService.registerDistributor(dto);
  }

  @ApiOperation({
    summary: 'Register Salesman',
    description: 'Creates a pending registration request for a Salesman.',
  })
  @ApiCreatedResponse({ description: 'Registration request created.' })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @Post('register/salesman')
  async registerSalesman(@Body() dto: RegisterSalesmanDto) {
    return this.authService.registerSalesman(dto);
  }

  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Refreshes JWT tokens using a valid refresh token.',
  })
  @ApiOkResponse({ description: 'Tokens refreshed.' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token.' })
  @Post('refresh')
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refresh_token);
  }

  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Logout',
    description: "Invalidates the user's session.",
  })
  @ApiOkResponse({ description: 'Successfully logged out.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }

  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get Profile',
    description: "Returns the currently authenticated user's basic profile.",
  })
  @ApiOkResponse({ description: 'Profile returned.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @ApiOperation({
    summary: 'Forgot Password',
    description: 'Requests a password reset email.',
  })
  @ApiCreatedResponse({
    description: 'If an account exists, a password reset link has been sent.',
  })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @ApiOperation({
    summary: 'Validate Reset Token',
    description:
      'Validates if a password reset token is valid and not expired.',
  })
  @ApiOkResponse({ description: 'Returns validity of the token.' })
  @Get('reset-password/validate')
  async validateResetToken(@Request() req) {
    const token = req.query.token as string;
    return this.authService.validateResetToken(token);
  }

  @ApiOperation({
    summary: 'Reset Password',
    description: 'Resets the password using a valid token.',
  })
  @ApiCreatedResponse({ description: 'Password reset successful.' })
  @ApiBadRequestResponse({ description: 'Validation failed or invalid token.' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
