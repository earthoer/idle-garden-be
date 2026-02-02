import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (public for registration)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      data: user,
      message: 'User created successfully',
    };
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID (requires authentication)' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '697dd77a7460c044869d03f2' })
  @ApiResponse({ status: 200, description: 'Returns user details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only access your own data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: any,
  ) {
    // Validate ownership
    if (currentUser.userId !== userId) {
      throw new ForbiddenException('You can only access your own data');
    }

    const user = await this.usersService.findOne(userId);
    return {
      success: true,
      data: user,
    };
  }

  @Get('google/:googleId')
  @ApiOperation({ summary: 'Get user by Google ID (public for login flow)' })
  @ApiParam({ name: 'googleId', description: 'Google ID', example: '104055744437937272058' })
  @ApiResponse({ status: 200, description: 'Returns user details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByGoogleId(@Param('googleId') googleId: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    return {
      success: true,
      data: user,
    };
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user details (requires authentication)' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '697dd77a7460c044869d03f2' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update your own data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    // Validate ownership
    if (currentUser.userId !== userId) {
      throw new ForbiddenException('You can only update your own data');
    }

    const user = await this.usersService.update(userId, updateUserDto);
    return {
      success: true,
      data: user,
      message: 'User updated successfully',
    };
  }

  @Get(':userId/state')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get complete game state for user (requires authentication)' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '697dd77a7460c044869d03f2' })
  @ApiResponse({ status: 200, description: 'Returns user data, planted trees, and stats' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only access your own data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getGameState(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: any,
  ) {
    // Validate ownership
    if (currentUser.userId !== userId) {
      throw new ForbiddenException('You can only access your own game state');
    }

    const gameState = await this.usersService.getGameState(userId);
    return {
      success: true,
      data: gameState,
    };
  }

  @Post(':userId/login')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update last login timestamp (requires authentication)' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '697dd77a7460c044869d03f2' })
  @ApiResponse({ status: 200, description: 'Last login updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update your own data' })
  async updateLastLogin(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: any,
  ) {
    // Validate ownership
    if (currentUser.userId !== userId) {
      throw new ForbiddenException('You can only update your own login time');
    }

    await this.usersService.updateLastLogin(userId);
    return {
      success: true,
      message: 'Last login updated',
    };
  }
}
