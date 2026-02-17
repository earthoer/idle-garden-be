import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectLocationDto {
  @ApiProperty({ description: 'Location ID to set as current', example: '507f1f77bcf86cd799439013' })
  @IsString()
  @IsNotEmpty()
  locationId: string;
}
