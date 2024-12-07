import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './internal/auth/auth.service';
import { AuthController } from './internal/auth/auth.controller';
import { AuthModule } from './internal/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from './internal/users/users.service';
import { UsersController } from './internal/users/users.controller';
import { UsersModule } from './internal/users/users.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './internal/auth/passport/guards/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import { PokemonModule } from './internal/pokemon/pokemon.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    PokemonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
