import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SellTreeDto {
  @ApiProperty({ description: 'Planted tree ID', example: '507f1f77bcf86cd799439014' })
  @IsString()
  @IsNotEmpty()
  plantedTreeId: string;
}
