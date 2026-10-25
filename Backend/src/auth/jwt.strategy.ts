import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject } from '@nestjs/common';
import { jwtConfig } from '../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(jwtConfig.KEY) private jwtCfg: any) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtCfg.secret,
    });
  }

  async validate(payload: any) {
    let role = payload.role;
    if (role === 'DISTRIBUTOR') role = 'DISTRIBUTOR_ADMIN';
    if (role === 'MANUFACTURER') role = 'MANUFACTURER_ADMIN';

    return {
      userId: payload.sub,
      email: payload.email,
      role,
      approvalStatus: payload.approvalStatus,
    };
  }
}
