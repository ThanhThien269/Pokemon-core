import { registerAs } from '@nestjs/config';
import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';

export default registerAs(
  'refresh-jwt',
  (): JwtSignOptions => ({
    secret: process.env.JWT_REFRESH_SECRET,

    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRED,
  }),
);