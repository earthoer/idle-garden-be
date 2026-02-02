import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum BoostType {
  TIME = 'time',
  SELL = 'sell',
}

export class ClaimAdRewardDto {
  @ApiProperty({ 
    enum: BoostType, 
    example: 'time',
    description: 'Type of boost to activate'
  })
  @IsEnum(BoostType)
  boostType: BoostType;
}
