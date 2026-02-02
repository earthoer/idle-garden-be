import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum LocationBonusType {
  CLICK_SPEED = 'click_speed',
  CLICK_CHANCE = 'click_chance',
  RARE_SEED_CHANCE = 'rare_seed_chance',
}

@Schema()
export class Location extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  // Pricing
  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  order: number;

  // Bonuses
  @Prop({ 
    required: true, 
    enum: Object.values(LocationBonusType) 
  })
  bonusType: LocationBonusType;

  @Prop({ required: true })
  bonusValue: number;

  @Prop({ required: true })
  bonusMultiplier: number;

  // Display
  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  locationImageUrl: string;

  @Prop({ required: true })
  potImageUrl: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

// Indexes
LocationSchema.index({ code: 1 }, { unique: true });
LocationSchema.index({ order: 1 });
