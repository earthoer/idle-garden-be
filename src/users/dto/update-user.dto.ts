import { IsNumber, IsOptional, IsBoolean, IsString, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  gold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalEarnings?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalTreesSold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalClicks?: number;

  @IsOptional()
  @IsString()
  currentLocation?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  premiumSlots?: number;

  @IsOptional()
  @IsBoolean()
  hasFairy?: boolean;

  @IsOptional()
  @IsBoolean()
  hasNoAds?: boolean;

  @IsOptional()
  @IsBoolean()
  clickPowerUpgrade?: boolean;

  @IsOptional()
  @IsBoolean()
  timeReductionUpgrade?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  longestCombo?: number;

  @IsOptional()
  @IsString()
  rarestTreeSold?: string;
}
