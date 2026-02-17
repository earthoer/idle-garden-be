import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuyLocationDto {
  @ApiProperty({ description: 'Location ID to purchase', example: '507f1f77bcf86cd799439013' })
  @IsString()
  @IsNotEmpty()
  locationId: string;
}
