import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdsService } from './ads.service';
import { ClaimAdRewardDto } from './dto/claim-ad-reward.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Ads')
@Controller('ads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get ad watching status (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Returns ad watching status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAdStatus(@CurrentUser() currentUser: any) {
    const status = await this.adsService.getAdStatus(currentUser.userId);
    
    return {
      success: true,
      data: status,
    };
  }

  @Post('reward')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim ad reward after watching (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Ad reward claimed successfully' })
  @ApiResponse({ status: 400, description: 'Daily limit reached or invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async claimReward(
    @Body() dto: ClaimAdRewardDto,
    @CurrentUser() currentUser: any,
  ) {
    const result = await this.adsService.claimReward(
      currentUser.userId,
      dto.boostType,
    );

    return {
      success: true,
      message: `${dto.boostType === 'time' ? 'Time reduction' : 'Sell multiplier'} boost activated!`,
      data: result,
    };
  }
}
