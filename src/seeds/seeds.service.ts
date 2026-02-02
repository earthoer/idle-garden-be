import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seed } from '../schemas/seed.schema';

@Injectable()
export class SeedsService {
  constructor(@InjectModel(Seed.name) private seedModel: Model<Seed>) {}

  async findAll(): Promise<Seed[]> {
    return await this.seedModel.find().sort({ basePrice: 1 }).exec();
  }

  async findOne(seedId: string): Promise<Seed> {
    return await this.seedModel.findById(seedId).exec();
  }

  async findByCode(code: string): Promise<Seed> {
    return await this.seedModel.findOne({ code }).exec();
  }

  async findAvailableForUser(userStats: {
    gold: number;
    totalTreesSold: number;
  }): Promise<Seed[]> {
    const allSeeds = await this.findAll();

    return allSeeds.filter((seed) => {
      const req = seed.unlockRequirement;

      switch (req.type) {
        case 'default':
          return true;
        case 'gold':
          return userStats.gold >= req.value;
        case 'trees_sold':
          return userStats.totalTreesSold >= req.value;
        case 'event':
          if (!seed.isEvent) return false;
          const now = new Date();
          return (
            seed.eventStart &&
            seed.eventEnd &&
            now >= seed.eventStart &&
            now <= seed.eventEnd
          );
        default:
          return false;
      }
    });
  }
}
