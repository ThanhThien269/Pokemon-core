import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { comparePasswordHelper } from '../../helper/util';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import refresh_jwtConfig from './configs/refresh_jwt.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(refresh_jwtConfig.KEY)
    private refreshJwtConfig: ConfigType<typeof refresh_jwtConfig>,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) return null;
    const isValidPassword = await comparePasswordHelper(pass, user.password);

    if (!isValidPassword) return null;
    return user;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user._id };
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.username,
      },
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, this.refreshJwtConfig),
    };
  }

  register = async (createAuthDto: CreateAuthDto) => {
    return await this.usersService.handleRegister(createAuthDto);
  };

  async refreshToken(user: any) {
    const payload = { sub: user._id };
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.username,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}
