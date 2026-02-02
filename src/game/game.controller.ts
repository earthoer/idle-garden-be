import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GameService } from './game.service';
import { PlantTreeDto } from './dto/plant-tree.dto';
import { ClickTreeDto } from './dto/click-tree.dto';
import { SellTreeDto } from './dto/sell-tree.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Game')
@Controller('game')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('plant')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Plant a new tree (requires authentication)' })
  @ApiResponse({ status: 201, description: 'Tree planted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request (not enough gold, slot occupied, etc.)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User or seed not found' })
  async plantTree(
    @Body() plantTreeDto: PlantTreeDto,
    @CurrentUser() currentUser: any,
  ) {
    const result = await this.gameService.plantTree(
      currentUser.userId,
      plantTreeDto,
    );
    
    return {
      success: true,
      message: 'Tree planted successfully',
      data: result,
    };
  }

  @Post('click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Water tree (batch clicks) to reduce grow time (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Tree watered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request (tree already ready, too many clicks, etc.)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User or tree not found' })
  async clickTree(
    @Body() clickTreeDto: ClickTreeDto,
    @CurrentUser() currentUser: any,
  ) {
    const result = await this.gameService.clickTree(
      currentUser.userId,
      clickTreeDto,
    );
    
    return {
      success: true,
      message: `Watered tree ${result.clicksProcessed} times (${result.timeReduced}s reduced)`,
      data: result,
    };
  }

  @Post('sell')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sell a ready tree (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Tree sold successfully' })
  @ApiResponse({ status: 400, description: 'Bad request (tree not ready, etc.)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User or tree not found' })
  async sellTree(
    @Body() sellTreeDto: SellTreeDto,
    @CurrentUser() currentUser: any,
  ) {
    const result = await this.gameService.sellTree(
      currentUser.userId,
      sellTreeDto,
    );
    
    return {
      success: true,
      message: `Sold ${result.seedName} (${result.quality}) for ${result.soldPrice}g`,
      data: result,
    };
  }
}
