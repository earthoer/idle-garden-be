import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { Request, Response } from "express";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Start Google OAuth login flow" })
  @ApiResponse({
    status: 302,
    description: "Redirects to Google OAuth consent screen",
  })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiExcludeEndpoint()
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // Validate user and get/create in DB
    const user = await this.authService.validateGoogleUser(req.user as any);

    // Generate JWT token
    const token = this.authService.generateJwtToken(user);

    // ⭐ Redirect กลับ Frontend พร้อม token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";

    // สำหรับ Mobile App (Expo)
    const mobileScheme = "idlegarden"; // ตาม app.json scheme
    const redirectUrl = `${mobileScheme}://auth?token=${token}`;

    // สำหรับ Web (ถ้ามี)
    // const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;

    return res.redirect(redirectUrl);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get current user profile (requires JWT)" })
  @ApiResponse({
    status: 200,
    description: "Returns user profile from JWT token",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - invalid or missing token",
  })
  async getProfile(@Req() req: Request) {
    return {
      success: true,
      data: req.user,
    };
  }

  @Get("status")
  @ApiOperation({ summary: "Check authentication service status" })
  @ApiResponse({ status: 200, description: "Returns auth service status" })
  async getStatus() {
    return {
      success: true,
      message: "Auth service is running",
      googleOAuthConfigured:
        !!this.configService.get<string>("GOOGLE_CLIENT_ID"),
    };
  }
}
