import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { PlantedTree, TreeQuality } from '../schemas/planted-tree.schema';
import { Seed } from '../schemas/seed.schema';
import { PlantTreeDto } from './dto/plant-tree.dto';
import { ClickTreeDto } from './dto/click-tree.dto';
import { SellTreeDto } from './dto/sell-tree.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(PlantedTree.name)
    private plantedTreeModel: Model<PlantedTree>,
    @InjectModel(Seed.name) private seedModel: Model<Seed>,
  ) {}

  // Plant a new tree
  async plantTree(plantTreeDto: PlantTreeDto) {
    const { userId, seedId, slotIndex } = plantTreeDto;

    // Validate IDs
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(seedId)) {
      throw new BadRequestException('Invalid user ID or seed ID');
    }

    // Get user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get seed
    const seed = await this.seedModel.findById(seedId);
    if (!seed) {
      throw new NotFoundException('Seed not found');
    }

    // Check if user has enough gold
    if (user.gold < seed.basePrice) {
      throw new BadRequestException(
        `Not enough gold. Need ${seed.basePrice}g, have ${user.gold}g`,
      );
    }

    // Check if slot is available
    const totalSlots = 1 + user.premiumSlots; // 1 default + premium
    if (slotIndex >= totalSlots) {
      throw new BadRequestException(
        `Invalid slot. You have ${totalSlots} slots (0-${totalSlots - 1})`,
      );
    }

    // Check if slot is already occupied
    const existingTree = await this.plantedTreeModel.findOne({
      userId,
      slotIndex,
    });

    if (existingTree) {
      throw new BadRequestException(
        `Slot ${slotIndex} is already occupied. Harvest or sell the tree first.`,
      );
    }

    // Determine tree quality
    const quality = this.determineQuality();

    // Calculate grow time
    const baseTime = seed.baseGrowTime;
    const timeReduction = user.timeReductionUpgrade ? 0.9 : 1; // -10% if upgraded
    const totalGrowTime = Math.floor(baseTime * timeReduction);

    // Create planted tree
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + totalGrowTime * 1000);

    const plantedTree = new this.plantedTreeModel({
      userId,
      slotIndex,
      seedId,
      quality,
      startTime,
      endTime,
      timeReduced: 0,
    });

    await plantedTree.save();

    // Deduct gold
    user.gold -= seed.basePrice;
    await user.save();

    // Populate seed info
    await plantedTree.populate('seedId');

    return {
      plantedTree,
      user: {
        gold: user.gold,
        totalSlots,
      },
    };
  }

  // Click tree to reduce time (batch update with combo)
  async clickTree(clickTreeDto: ClickTreeDto) {
    const { userId, plantedTreeId, clicks, timeReduction } = clickTreeDto;

    // Validate IDs
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(plantedTreeId)
    ) {
      throw new BadRequestException('Invalid user ID or planted tree ID');
    }

    // Get user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get planted tree
    const plantedTree = await this.plantedTreeModel
      .findById(plantedTreeId)
      .populate('seedId');

    if (!plantedTree) {
      throw new NotFoundException('Planted tree not found');
    }

    // Check if tree belongs to user
    if (plantedTree.userId.toString() !== userId) {
      throw new BadRequestException('This tree does not belong to you');
    }

    // Check if tree is already ready
    const now = new Date();
    if (plantedTree.endTime <= now) {
      throw new BadRequestException('Tree is already ready to harvest');
    }

    // Calculate current time left
    const currentTimeLeft = Math.max(
      0,
      Math.floor((plantedTree.endTime.getTime() - now.getTime()) / 1000),
    );

    // Don't reduce more than remaining time
    const actualReduction = Math.min(timeReduction, currentTimeLeft);

    // Validate timeReduction is reasonable (anti-cheat)
    // Max: 10 seconds per click (very generous for combo bonus)
    const maxReasonable = clicks * 10;
    if (timeReduction > maxReasonable) {
      throw new BadRequestException(
        `Time reduction too high. Max ${maxReasonable}s for ${clicks} clicks`,
      );
    }

    // Update tree
    plantedTree.timeReduced += actualReduction;
    plantedTree.endTime = new Date(
      plantedTree.endTime.getTime() - actualReduction * 1000,
    );

    await plantedTree.save();

    // Increment user clicks
    user.totalClicks += clicks;
    await user.save();

    // Calculate time left after reduction
    const timeLeft = Math.max(
      0,
      Math.floor((plantedTree.endTime.getTime() - now.getTime()) / 1000),
    );

    return {
      plantedTree,
      timeLeft,
      isReady: timeLeft === 0,
      clicksProcessed: clicks,
      timeReduced: actualReduction,
      totalClicks: user.totalClicks,
    };
  }

  // Sell tree
  async sellTree(sellTreeDto: SellTreeDto) {
    const { userId, plantedTreeId } = sellTreeDto;

    // Validate IDs
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(plantedTreeId)
    ) {
      throw new BadRequestException('Invalid user ID or planted tree ID');
    }

    // Get user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get planted tree
    const plantedTree = await this.plantedTreeModel
      .findById(plantedTreeId)
      .populate('seedId');

    if (!plantedTree) {
      throw new NotFoundException('Planted tree not found');
    }

    // Check if tree belongs to user
    if (plantedTree.userId.toString() !== userId) {
      throw new BadRequestException('This tree does not belong to you');
    }

    // Check if tree is ready
    const now = new Date();
    if (plantedTree.endTime > now) {
      const timeLeft = Math.ceil(
        (plantedTree.endTime.getTime() - now.getTime()) / 1000,
      );
      throw new BadRequestException(
        `Tree is not ready yet. Wait ${timeLeft} more seconds.`,
      );
    }

    // Calculate sell price
    const seed = plantedTree.seedId as any;
    const sellPrice = this.calculateSellPrice(
      seed.baseSellPrice,
      plantedTree.quality,
      user.adBoosts.sellMultiplier,
    );

    // Update user
    user.gold += sellPrice;
    user.totalEarnings += sellPrice;
    user.totalTreesSold += 1;

    // Update rarest tree sold
    if (
      plantedTree.quality === TreeQuality.RAINBOW &&
      (!user.rarestTreeSold || user.rarestTreeSold !== 'rainbow')
    ) {
      user.rarestTreeSold = 'rainbow';
    } else if (
      plantedTree.quality === TreeQuality.GOLDEN &&
      !user.rarestTreeSold
    ) {
      user.rarestTreeSold = 'golden';
    }

    await user.save();

    // Reset ad boost multiplier if used
    if (user.adBoosts.sellMultiplier > 1) {
      user.adBoosts.sellMultiplier = 1;
      await user.save();
    }

    // Delete planted tree
    await this.plantedTreeModel.findByIdAndDelete(plantedTreeId);

    return {
      soldPrice: sellPrice,
      quality: plantedTree.quality,
      seedName: seed.name,
      user: {
        gold: user.gold,
        totalEarnings: user.totalEarnings,
        totalTreesSold: user.totalTreesSold,
      },
    };
  }

  // Calculate sell price based on quality and multipliers
  private calculateSellPrice(
    basePrice: number,
    quality: TreeQuality,
    adMultiplier: number,
  ): number {
    let qualityMultiplier = 1;

    switch (quality) {
      case TreeQuality.WITHERED:
        qualityMultiplier = 0.5;
        break;
      case TreeQuality.NORMAL:
        qualityMultiplier = 1;
        break;
      case TreeQuality.GOLDEN:
        qualityMultiplier = 2;
        break;
      case TreeQuality.RAINBOW:
        qualityMultiplier = 5;
        break;
    }

    return Math.floor(basePrice * qualityMultiplier * adMultiplier);
  }

  // Determine tree quality randomly
  private determineQuality(): TreeQuality {
    const random = Math.random() * 100;

    // 1% Rainbow
    if (random < 1) {
      return TreeQuality.RAINBOW;
    }
    // 10% Golden
    else if (random < 11) {
      return TreeQuality.GOLDEN;
    }
    // 5% Withered
    else if (random < 16) {
      return TreeQuality.WITHERED;
    }
    // 84% Normal
    else {
      return TreeQuality.NORMAL;
    }
  }
}
