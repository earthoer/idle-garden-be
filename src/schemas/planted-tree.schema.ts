import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TreeQuality {
  WITHERED = 'withered',
  NORMAL = 'normal',
  GOLDEN = 'golden',
  RAINBOW = 'rainbow',
}

@Schema({ timestamps: true })
export class PlantedTree extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 4 })
  slotIndex: number;

  // Tree Info
  @Prop({ type: Types.ObjectId, ref: 'Seed', required: true })
  seedId: Types.ObjectId;

  @Prop({ 
    required: true, 
    enum: Object.values(TreeQuality),
    default: TreeQuality.NORMAL 
  })
  quality: TreeQuality;

  // Time Management
  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ default: 0 })
  timeReduced: number;

  // Timestamps (auto by mongoose)
  createdAt: Date;
  updatedAt: Date;
}

export const PlantedTreeSchema = SchemaFactory.createForClass(PlantedTree);

// Indexes
PlantedTreeSchema.index({ userId: 1, slotIndex: 1 }, { unique: true });
PlantedTreeSchema.index({ userId: 1 });
