import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { BuyLocationDto } from './dto/buy-location.dto';
import { SelectLocationDto } from './dto/select-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, description: 'Returns all locations sorted by order' })
  async findAll() {
    const locations = await this.locationsService.findAll();
    return {
      success: true,
      data: locations,
      count: locations.length,
    };
  }

  @Get('available')
  @ApiOperation({ summary: 'Get locations available for user' })
  @ApiQuery({ name: 'gold', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Returns locations user can afford' })
  async findAvailable(@Query('gold') gold: string) {
    const locations = await this.locationsService.findAvailableForUser(
      Number(gold) || 0,
    );

    return {
      success: true,
      data: locations,
      count: locations.length,
    };
  }

  @Post('buy')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buy a new location (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Location purchased successfully' })
  @ApiResponse({ status: 400, description: 'Not enough gold or location already unlocked' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async buyLocation(
    @Body() buyLocationDto: BuyLocationDto,
    @CurrentUser() currentUser: any,
  ) {
    const result = await this.locationsService.buyLocation(
      currentUser.userId,
      buyLocationDto.locationId,
    );

    return {
      success: true,
      message: `Purchased ${result.purchasedLocation.name} for ${result.goldSpent}g`,
      data: result,
    };
  }

  @Post('select')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select current location (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Location selected successfully' })
  @ApiResponse({ status: 400, description: 'Location not unlocked yet' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async selectLocation(
    @Body() selectLocationDto: SelectLocationDto,
    @CurrentUser() currentUser: any,
  ) {
    const result = await this.locationsService.selectLocation(
      currentUser.userId,
      selectLocationDto.locationId,
    );

    return {
      success: true,
      message: `Switched to ${result.selectedLocation.name}`,
      data: result,
    };
  }

  @Get(':locationId')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiResponse({ status: 200, description: 'Returns location details' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async findOne(@Param('locationId') locationId: string) {
    const location = await this.locationsService.findOne(locationId);

    if (!location) {
      return {
        success: false,
        message: 'Location not found',
      };
    }

    return {
      success: true,
      data: location,
    };
  }
}
