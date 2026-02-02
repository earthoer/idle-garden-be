import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlantTreeDto {
  @ApiProperty({ description: 'Seed ID', example: '507f1f77bcf86cd799439013' })
  @IsString()
  @IsNotEmpty()
  seedId: string;

  @ApiProperty({ description: 'Slot index (0-4)', example: 0, minimum: 0, maximum: 4 })
  @IsNumber()
  @Min(0)
  @Max(4)
  slotIndex: number;
}
