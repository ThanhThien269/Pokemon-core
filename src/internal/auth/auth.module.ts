import { Module, Scope } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './configs/jwt.config';
import { ConfigModule } from '@nestjs/config';
import refresh_jwtConfig from './configs/refresh_jwt.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './passport/stragies/local.strategy';
import { JwtStrategy } from './passport/stragies/jwt.strategy';
import { RefreshJwtStrategy } from './passport/stragies/rf-jwt.strategy';
import { RequestService } from 'src/utils/request.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from 'src/core/logging.interceptor';

@Module({
  imports: [
    UsersModule,
    PassportModule,

    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refresh_jwtConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    RequestService,
    {
      provide: APP_INTERCEPTOR,
      // scope must be defined since we inject a request-scope dependencies
      scope: Scope.REQUEST,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AuthModule {}
