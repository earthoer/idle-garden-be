import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Nested object class
class AdBoosts {
  @Prop({ default: 0 })
  timeReductionAvailable: number;

  @Prop({ default: 1 })
  sellMultiplier: number;

  @Prop({ default: null })
  lastAdWatchedAt: Date;

  @Prop({ default: 0 })
  dailyAdsWatched: number;

  @Prop({ default: 0 })
  totalAdWatchCount: number;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  googleId: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  // Game Progress
  @Prop({ default: 0 })
  gold: number;

  @Prop({ default: 0 })
  totalEarnings: number;

  @Prop({ default: 0 })
  totalTreesSold: number;

  @Prop({ default: 0 })
  totalClicks: number;

  // Location & Slots
  @Prop({ type: Types.ObjectId, ref: 'Location' })
  currentLocation: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Location' }], default: [] })
  unlockedLocations: Types.ObjectId[];

  @Prop({ default: 0, max: 4 })
  premiumSlots: number;

  // Collection Progress
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Seed' }], default: [] })
  unlockedSeeds: Types.ObjectId[];

  @Prop({ default: 0 })
  collectionProgress: number;

  // Premium Features
  @Prop({ default: false })
  hasFairy: boolean;

  @Prop({ default: false })
  hasNoAds: boolean;

  @Prop({ default: false })
  clickPowerUpgrade: boolean;

  @Prop({ default: false })
  timeReductionUpgrade: boolean;

  // Ad Boosts
  @Prop({ type: AdBoosts, default: () => ({}), _id: false })
  adBoosts: AdBoosts;

  // Stats
  @Prop({ default: 0 })
  longestCombo: number;

  @Prop({ default: null })
  rarestTreeSold: string;

  // Timestamps (auto by mongoose)
  @Prop({ default: Date.now })
  lastLogin: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ googleId: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ totalEarnings: -1 }); // for leaderboard
UserSchema.index({ totalTreesSold: -1 }); // for leaderboard
