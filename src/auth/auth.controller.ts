import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CurrentUserDto } from '../decorators/dto/current-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthResponseDto, UserAuthDto } from './dto/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Body() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@CurrentUser() user: CurrentUserDto): Promise<UserAuthDto> {
    return this.authService.me(user.user);
  }
}
