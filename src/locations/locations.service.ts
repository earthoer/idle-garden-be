import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location } from '../schemas/location.schema';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<Location>,
  ) {}

  async findAll(): Promise<Location[]> {
    return await this.locationModel.find().sort({ order: 1 }).exec();
  }

  async findOne(locationId: string): Promise<Location> {
    return await this.locationModel.findById(locationId).exec();
  }

  async findByCode(code: string): Promise<Location> {
    return await this.locationModel.findOne({ code }).exec();
  }

  async findAvailableForUser(userGold: number): Promise<Location[]> {
    const allLocations = await this.findAll();
    return allLocations.filter((location) => userGold >= location.price);
  }
}
