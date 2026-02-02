import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { PlantedTree } from '../schemas/planted-tree.schema';
import { Location } from '../schemas/location.schema';
import { Seed } from '../schemas/seed.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(PlantedTree.name) private plantedTreeModel: Model<PlantedTree>,
    @InjectModel(Location.name) private locationModel: Model<Location>,
    @InjectModel(Seed.name) private seedModel: Model<Seed>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [
        { googleId: createUserDto.googleId },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('User with this Google ID or email already exists');
    }

    // Get default location (Waste Land)
    const defaultLocation = await this.locationModel.findOne({ code: 'waste_land' });
    if (!defaultLocation) {
      throw new NotFoundException('Default location not found. Please run seed script.');
    }

    // Get default seed (Bean Sprout)
    const defaultSeed = await this.seedModel.findOne({ code: 'bean_sprout' });

    // Create new user with defaults
    const newUser = new this.userModel({
      ...createUserDto,
      gold: 0,
      totalEarnings: 0,
      totalTreesSold: 0,
      totalClicks: 0,
      currentLocation: defaultLocation._id,
      unlockedLocations: [defaultLocation._id],
      premiumSlots: 0,
      unlockedSeeds: defaultSeed ? [defaultSeed._id] : [],
      collectionProgress: defaultSeed ? 1 : 0,
      hasFairy: false,
      hasNoAds: false,
      clickPowerUpgrade: false,
      timeReductionUpgrade: false,
      adBoosts: {
        timeReductionAvailable: 0,
        sellMultiplier: 1,
        lastAdWatchedAt: null,
      },
      longestCombo: 0,
      rarestTreeSold: null,
      lastLogin: new Date(),
    });

    return await newUser.save();
  }

  async findOne(userId: string): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.userModel
      .findById(userId)
      .populate('currentLocation')
      .populate('unlockedLocations')
      .populate('unlockedSeeds');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByGoogleId(googleId: string): Promise<User> {
    const user = await this.userModel
      .findOne({ googleId })
      .populate('currentLocation')
      .populate('unlockedLocations')
      .populate('unlockedSeeds');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateUserDto },
      { new: true },
    )
      .populate('currentLocation')
      .populate('unlockedLocations')
      .populate('unlockedSeeds');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { lastLogin: new Date() },
    });
  }

  async getGameState(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    // Get user data
    const user = await this.findOne(userId);

    // Get all planted trees for this user
    const plantedTrees = await this.plantedTreeModel
      .find({ userId })
      .populate('seedId')
      .sort({ slotIndex: 1 });

    // Calculate time remaining for each tree
    const now = new Date();
    const treesWithTimeLeft = plantedTrees.map((tree) => {
      const endTime = new Date(tree.endTime);
      const timeLeft = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
      
      return {
        ...tree.toObject(),
        timeLeft,
        isReady: timeLeft === 0,
      };
    });

    return {
      user,
      plantedTrees: treesWithTimeLeft,
      stats: {
        totalSlots: 1 + user.premiumSlots,
        occupiedSlots: plantedTrees.length,
        availableSlots: 1 + user.premiumSlots - plantedTrees.length,
      },
    };
  }

  async addGold(userId: string, amount: number): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $inc: {
          gold: amount,
          totalEarnings: amount > 0 ? amount : 0,
        },
      },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async incrementTreesSold(userId: string): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { totalTreesSold: 1 } },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async incrementClicks(userId: string, count: number = 1): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { totalClicks: count } },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
