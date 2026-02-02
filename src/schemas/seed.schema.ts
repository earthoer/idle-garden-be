import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UnlockRequirementType {
  DEFAULT = 'default',
  GOLD = 'gold',
  TREES_SOLD = 'trees_sold',
  EVENT = 'event',
}

// Nested object class
class UnlockRequirement {
  @Prop({ required: true, enum: Object.values(UnlockRequirementType) })
  type: UnlockRequirementType;

  @Prop({ required: true })
  value: number;
}

@Schema()
export class Seed extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  // Pricing
  @Prop({ required: true })
  basePrice: number;

  @Prop({ required: true })
  baseSellPrice: number;

  // Growth
  @Prop({ required: true })
  baseGrowTime: number; // in seconds

  // Unlock
  @Prop({ type: UnlockRequirement, required: true, _id: false })
  unlockRequirement: UnlockRequirement;

  // Display
  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  description: string;

  // Availability
  @Prop({ default: false })
  isEvent: boolean;

  @Prop({ default: null })
  eventStart: Date;

  @Prop({ default: null })
  eventEnd: Date;
}

export const SeedSchema = SchemaFactory.createForClass(Seed);

// Indexes
SeedSchema.index({ code: 1 }, { unique: true });
SeedSchema.index({ isEvent: 1 });
