import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import refresh_jwtConfig from '../../configs/refresh_jwt.config';
@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    private configService: ConfigService,
    @Inject(refresh_jwtConfig.KEY)
    private refreshJwtConfig: ConfigType<typeof refresh_jwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: refreshJwtConfig.secret,
    });
  }

  async validate(payload: any) {
    return { _id: payload.sub, username: payload.username };
  }
}
