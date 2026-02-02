import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SeedsService } from './seeds.service';

@ApiTags('Seeds')
@Controller('seeds')
export class SeedsController {
  constructor(private readonly seedsService: SeedsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all seeds' })
  @ApiResponse({ status: 200, description: 'Returns all seeds sorted by price' })
  async findAll() {
    const seeds = await this.seedsService.findAll();
    return {
      success: true,
      data: seeds,
      count: seeds.length,
    };
  }

  @Get('available')
  @ApiOperation({ summary: 'Get seeds available for user' })
  @ApiQuery({ name: 'gold', required: true, type: Number })
  @ApiQuery({ name: 'totalTreesSold', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Returns seeds user can unlock' })
  async findAvailable(
    @Query('gold') gold: string,
    @Query('totalTreesSold') totalTreesSold: string,
  ) {
    const seeds = await this.seedsService.findAvailableForUser({
      gold: Number(gold) || 0,
      totalTreesSold: Number(totalTreesSold) || 0,
    });

    return {
      success: true,
      data: seeds,
      count: seeds.length,
    };
  }

  @Get(':seedId')
  @ApiOperation({ summary: 'Get seed by ID' })
  @ApiResponse({ status: 200, description: 'Returns seed details' })
  @ApiResponse({ status: 404, description: 'Seed not found' })
  async findOne(@Param('seedId') seedId: string) {
    const seed = await this.seedsService.findOne(seedId);
    
    if (!seed) {
      return {
        success: false,
        message: 'Seed not found',
      };
    }

    return {
      success: true,
      data: seed,
    };
  }
}
