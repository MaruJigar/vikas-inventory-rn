import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppSocketGateway } from './socket.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'supersecret'),
      }),
    }),
  ],
  providers: [AppSocketGateway],
  exports: [AppSocketGateway],
})
export class SocketGatewayModule {}
