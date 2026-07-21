import { Controller, Post, Get, Patch, Body, UseGuards, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, userData } = await this.authService.login(loginDto);

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      success: true,
      message: 'Login successful',
      data: { user: userData },
    };
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() currentUser: any) {
    const profile = await this.authService.getProfile(currentUser.id);
    return { success: true, data: profile };
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own profile (name, email, profile image)' })
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.authService.updateProfile(currentUser.id, dto);
  }

  @Patch('password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own password' })
  @UseGuards(JwtAuthGuard)
  updatePassword(
    @Body() dto: UpdatePasswordDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.authService.updatePassword(
      currentUser.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', { path: '/' });
    return { success: true, message: 'Logged out successfully' };
  }
}
