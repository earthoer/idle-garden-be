import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { BoostType } from './dto/claim-ad-reward.dto';

@Injectable()
export class AdsService {
  private readonly MAX_DAILY_ADS = 2;
  private readonly TIME_REDUCTION_SECONDS = 30;
  private readonly SELL_MULTIPLIER = 2;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Check if user can watch an ad today
   * Returns updated user with reset counter if it's a new day
   */
  async checkAndResetDailyLimit(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = new Date();
    const lastAdDate = user.adBoosts?.lastAdWatchedAt;

    // Check if it's a new day (reset at midnight)
    if (lastAdDate && this.isNewDay(lastAdDate, now)) {
      // Reset daily counter
      user.adBoosts.dailyAdsWatched = 0;
      await user.save();
    }

    return user;
  }

  /**
   * Check if two dates are on different days
   */
  private isNewDay(date1: Date, date2: Date): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return (
      d1.getFullYear() !== d2.getFullYear() ||
      d1.getMonth() !== d2.getMonth() ||
      d1.getDate() !== d2.getDate()
    );
  }

  /**
   * Claim ad reward
   */
  async claimReward(userId: string, boostType: BoostType) {
    // Check and reset if new day
    const user = await this.checkAndResetDailyLimit(userId);

    // Check if user has reached daily limit
    if (user.adBoosts.dailyAdsWatched >= this.MAX_DAILY_ADS) {
      throw new BadRequestException(
        `You have reached the daily ad limit (${this.MAX_DAILY_ADS} ads per day). Try again tomorrow!`
      );
    }

    // Apply boost
    if (boostType === BoostType.TIME) {
      user.adBoosts.timeReductionAvailable = this.TIME_REDUCTION_SECONDS;
    } else {
      user.adBoosts.sellMultiplier = this.SELL_MULTIPLIER;
    }

    // Update tracking
    user.adBoosts.lastAdWatchedAt = new Date();
    user.adBoosts.dailyAdsWatched += 1;
    user.adBoosts.totalAdWatchCount += 1;  // เพิ่ม total count

    await user.save();

    return {
      boostType,
      boostValue: boostType === BoostType.TIME 
        ? this.TIME_REDUCTION_SECONDS 
        : this.SELL_MULTIPLIER,
      dailyAdsWatched: user.adBoosts.dailyAdsWatched,
      adsRemaining: this.MAX_DAILY_ADS - user.adBoosts.dailyAdsWatched,
      totalAdWatchCount: user.adBoosts.totalAdWatchCount,
    };
  }

  /**
   * Get user's ad status
   */
  async getAdStatus(userId: string) {
    const user = await this.checkAndResetDailyLimit(userId);

    return {
      dailyAdsWatched: user.adBoosts.dailyAdsWatched,
      adsRemaining: this.MAX_DAILY_ADS - user.adBoosts.dailyAdsWatched,
      maxDailyAds: this.MAX_DAILY_ADS,
      canWatchAd: user.adBoosts.dailyAdsWatched < this.MAX_DAILY_ADS,
      lastAdWatchedAt: user.adBoosts.lastAdWatchedAt,
      totalAdWatchCount: user.adBoosts.totalAdWatchCount,
      activeBoosts: {
        timeReduction: user.adBoosts.timeReductionAvailable,
        sellMultiplier: user.adBoosts.sellMultiplier,
      },
    };
  }
}
