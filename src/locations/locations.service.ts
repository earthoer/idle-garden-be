import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Location } from '../schemas/location.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<Location>,
    @InjectModel(User.name) private userModel: Model<User>,
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

  async buyLocation(userId: string, locationId: string) {
    if (!Types.ObjectId.isValid(locationId)) {
      throw new NotFoundException('Invalid location ID');
    }

    const location = await this.locationModel.findById(locationId);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already unlocked
    const alreadyUnlocked = user.unlockedLocations.some(
      (loc) => loc.toString() === locationId,
    );
    if (alreadyUnlocked) {
      throw new BadRequestException('Location already unlocked');
    }

    // Check if user has enough gold
    if (user.gold < location.price) {
      throw new BadRequestException(
        `Not enough gold. Need ${location.price}, have ${user.gold}`,
      );
    }

    // Deduct gold and add location to unlocked list
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $inc: { gold: -location.price },
          $push: { unlockedLocations: location._id },
        },
        { new: true },
      )
      .populate('currentLocation')
      .populate('unlockedLocations');

    return {
      user: updatedUser,
      purchasedLocation: location,
      goldSpent: location.price,
    };
  }

  async selectLocation(userId: string, locationId: string) {
    if (!Types.ObjectId.isValid(locationId)) {
      throw new NotFoundException('Invalid location ID');
    }

    const location = await this.locationModel.findById(locationId);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the location is unlocked
    const isUnlocked = user.unlockedLocations.some(
      (loc) => loc.toString() === locationId,
    );
    if (!isUnlocked) {
      throw new BadRequestException('Location not unlocked yet');
    }

    // Set as current location
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { currentLocation: location._id } },
        { new: true },
      )
      .populate('currentLocation')
      .populate('unlockedLocations');

    return {
      user: updatedUser,
      selectedLocation: location,
    };
  }
}
