import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClickTreeDto {
  @ApiProperty({ description: 'Planted tree ID', example: '507f1f77bcf86cd799439014' })
  @IsString()
  @IsNotEmpty()
  plantedTreeId: string;

  @ApiProperty({ 
    description: 'Number of clicks (for tracking)', 
    example: 5, 
    minimum: 1,
    maximum: 1000
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  clicks: number;

  @ApiProperty({ 
    description: 'Total time reduction in seconds (calculated by frontend with combo bonus)', 
    example: 12,
    minimum: 1,
    maximum: 10000
  })
  @IsNumber()
  @Min(1)
  @Max(10000)
  timeReduction: number;
}
