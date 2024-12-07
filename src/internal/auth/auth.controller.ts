import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { RequestService } from 'src/utils/request.service';
import { AuthService } from './auth.service';
import { Public, ResponseMessage } from './decorator/customize';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LocalAuthGuard } from './passport/guards/local-auth.guard';
import { RefreshJwtAuthGuard } from './passport/guards/refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly requestService: RequestService,
  ) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Fetch login')
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Public()
  @Post('refresh')
  refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }
}
