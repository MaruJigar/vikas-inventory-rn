import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppSocketGateway } from './socket.gateway';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from '../config/jwt.config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [jwtConfig.KEY],
      useFactory: (jwtCfg: any) => ({
        secret: jwtCfg.secret,
      }),
    }),
  ],
  providers: [AppSocketGateway],
  exports: [AppSocketGateway],
})
export class SocketGatewayModule {}
