import { Controller, Post, Body, UseGuards, Get, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() req: { email: string; password: string }) {
    return this.authService.login(req.email, req.password);
  }

  @Post('register')
  async register(@Body() createUserDto: { email: string; password: string; firstName?: string; lastName?: string }) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }
}
