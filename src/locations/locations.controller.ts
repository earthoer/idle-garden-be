import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LocationsService } from './locations.service';

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
