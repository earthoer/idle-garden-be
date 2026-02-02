import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Start Google OAuth login flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth consent screen' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiExcludeEndpoint()
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      // Validate and create/update user
      const user = await this.authService.validateGoogleUser(req.user as any);
      
      // Generate JWT token
      const loginResult = await this.authService.login(user);
      const token = loginResult.access_token;
      
      // ⭐ Check if mobile or web
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /Mobile|Android|iPhone|Expo/i.test(userAgent);
      
      let redirectUrl: string;
      
      if (isMobile) {
        // Mobile: Deep link
        redirectUrl = `idlegarden://auth?token=${token}`;
      } else {
        // Web: HTTP redirect
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8081';
        redirectUrl = `${frontendUrl}?token=${token}`;
      }
      
      console.log('User-Agent:', userAgent);
      console.log('Is Mobile:', isMobile);
      console.log('Redirecting to:', redirectUrl);
      
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      return res.status(500).send('Authentication failed');
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile (requires JWT)' })
  @ApiResponse({ status: 200, description: 'Returns user profile from JWT token' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  async getProfile(@Req() req: Request) {
    return {
      success: true,
      data: req.user,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Check authentication service status' })
  @ApiResponse({ status: 200, description: 'Returns auth service status' })
  async getStatus() {
    return {
      success: true,
      message: 'Auth service is running',
      googleOAuthConfigured: !!this.configService.get<string>('GOOGLE_CLIENT_ID'),
    };
  }
}
