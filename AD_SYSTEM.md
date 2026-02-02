# Ad System - Architecture & Implementation

## 🎯 คำถาม: ทำฝั่งไหนดี?

**คำตอบ: แบ่งหน้าที่กัน Frontend + Backend ร่วมกัน**

---

## 🏗️ Architecture (แนะนำ):

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Frontend   │         │   Backend   │         │  Ad Network │
│ (React/RN)  │         │   (NestJS)  │         │ (AdMob/etc) │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                        │
       │ 1. Request ad         │                        │
       │───────────────────────────────────────────────>│
       │                       │                        │
       │ 2. Display ad         │                        │
       │<──────────────────────────────────────────────│
       │                       │                        │
       │ 3. User watches       │                        │
       │ (ad completion)       │                        │
       │                       │                        │
       │ 4. POST /api/ads/reward                       │
       │───────────────────────>│                       │
       │      (optional token) │                        │
       │                       │                        │
       │                       │ 5. Validate           │
       │                       │    Apply boost        │
       │                       │    Save to DB         │
       │                       │                        │
       │ 6. Return success     │                        │
       │<──────────────────────│                        │
       │                       │                        │
```

---

## 📋 แบ่งหน้าที่:

### Frontend (React Native / Web):
✅ แสดงโฆษณา (AdMob, Unity Ads, etc.)
✅ ตรวจจับว่าดูจบหรือยัง
✅ ยิง API ขอรับ reward
✅ อัพเดท UI (แสดง boost active)
✅ Track ad metrics

### Backend (NestJS):
✅ API endpoint รับ reward request
✅ Validate request (ป้องกัน cheat)
✅ Apply boost ให้ user
✅ Save ข้อมูลใน DB
✅ Return success/error

### Ad Network (AdMob/Unity/etc.):
✅ Serve ads
✅ Track impressions
✅ Handle payments
✅ (Optional) Verification token

---

## 🎮 ระบบที่มีใน Schema แล้ว:

```typescript
// User Schema - AdBoosts (nested object)
adBoosts: {
  timeReductionAvailable: number;    // เท่าไหร่ (seconds)
  sellMultiplier: number;            // เท่าไหร่ (multiplier)
  lastAdWatchedAt: Date;             // ⭐ เวลาดู ad ล่าสุด
  dailyAdsWatched: number;           // ⭐ จำนวนวันนี้ (0-2)
  totalAdWatchCount: number;         // ⭐ รวมทั้งหมด (all time)
}
```

**Daily Limit:** วันละ 2 ครั้ง (reset เที่ยงคืน)

**2 ประเภท Boost:**
1. **Time Reduction Boost** - ลดเวลาโต 30 วินาที
2. **Sell Multiplier Boost** - ขายได้เงินเพิ่ม 2x

---

## 💻 Implementation:

### 1. Frontend (React Native - AdMob):

```bash
# Install
yarn add react-native-google-mobile-ads
```

### React Native (AdMob):

```bash
# Install
yarn add react-native-google-mobile-ads
```

```typescript
import { RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

// Initialize ad
const rewardedAd = RewardedAd.createForAdRequest('ca-app-pub-xxx/xxx');

// Load ad
useEffect(() => {
  const unsubscribe = rewardedAd.addAdEventListener(
    RewardedAdEventType.LOADED,
    () => {
      console.log('Ad loaded');
    }
  );
  
  rewardedAd.load();
  return unsubscribe;
}, []);

// ⭐ เช็ค status ก่อนแสดง ad
async function watchAdForBoost(boostType: 'time' | 'sell') {
  try {
    // 1. เช็คว่าดูได้หรือยัง (วันละ 2 ครั้ง)
    const statusRes = await fetch(`${API_URL}/ads/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const status = await statusRes.json();
    
    if (!status.data.canWatchAd) {
      Alert.alert(
        'Daily Limit Reached',
        `คุณดูโฆษณาครบแล้ววันนี้! (${status.data.dailyAdsWatched}/2)\nกลับมาพรุ่งนี้นะ 😊`
      );
      return;
    }
    
    // 2. แสดงโฆษณา
    await rewardedAd.show();
    
    // 3. ดูจบแล้ว - ยิง API เพื่อรับ reward
    const rewardRes = await fetch(`${API_URL}/ads/reward`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ boostType })
    });
    
    const result = await rewardRes.json();
    
    if (result.success) {
      Alert.alert(
        'Boost Activated! 🎉',
        `${boostType === 'time' ? '-30s' : '2x sell'} boost activated!\n` +
        `Ads today: ${result.data.dailyAdsWatched}/2\n` +
        `Total: ${result.data.totalAdWatchCount} ads watched`
      );
      refreshUserData();
    }
  } catch (error) {
    if (error.response?.status === 400) {
      Alert.alert('Error', 'Daily limit reached! Try again tomorrow.');
    } else {
      console.error('Ad failed:', error);
    }
  }
}

// UI with status
function AdSection() {
  const [adStatus, setAdStatus] = useState(null);
  
  useEffect(() => {
    fetchAdStatus();
  }, []);
  
  async function fetchAdStatus() {
    const res = await fetch(`${API_URL}/ads/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setAdStatus(data.data);
  }
  
  if (!adStatus) return <Loading />;
  
  return (
    <View>
      <Text>Ads Today: {adStatus.dailyAdsWatched}/2</Text>
      <Text>Total Watched: {adStatus.totalAdWatchCount}</Text>
      
      <Button 
        onPress={() => watchAdForBoost('time')}
        disabled={!adStatus.canWatchAd}
      >
        {adStatus.canWatchAd 
          ? `📺 Watch Ad → -30s Time Boost (${adStatus.adsRemaining} left)`
          : '⏰ Daily Limit Reached'}
      </Button>
      
      <Button 
        onPress={() => watchAdForBoost('sell')}
        disabled={!adStatus.canWatchAd}
      >
        {adStatus.canWatchAd
          ? `📺 Watch Ad → 2x Sell Price (${adStatus.adsRemaining} left)`
          : '⏰ Come Back Tomorrow!'}
      </Button>
    </View>
  );
}
```

---

### 2. Backend API:

#### Endpoints:
```typescript
GET  /api/ads/status  - เช็คสถานะ (วันนี้ดูไปกี่ครั้ง)
POST /api/ads/reward  - รับ reward หลังดู ad
```

#### Create DTO:
```typescript
// src/ads/dto/claim-ad-reward.dto.ts
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum BoostType {
  TIME = 'time',
  SELL = 'sell',
}

export class ClaimAdRewardDto {
  @ApiProperty({ enum: BoostType, example: 'time' })
  @IsEnum(BoostType)
  boostType: BoostType;
}
```

#### Create Service:
```typescript
// src/ads/ads.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class AdsService {
  private readonly MAX_DAILY_ADS = 2;  // ⭐ วันละ 2 ครั้ง

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // เช็คและ reset ถ้าเป็นวันใหม่
  async checkAndResetDailyLimit(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    const now = new Date();
    const lastAdDate = user.adBoosts?.lastAdWatchedAt;

    if (lastAdDate && this.isNewDay(lastAdDate, now)) {
      user.adBoosts.dailyAdsWatched = 0;  // ⭐ Reset!
      await user.save();
    }

    return user;
  }

  private isNewDay(date1: Date, date2: Date): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return (
      d1.getFullYear() !== d2.getFullYear() ||
      d1.getMonth() !== d2.getMonth() ||
      d1.getDate() !== d2.getDate()
    );
  }

  async claimReward(userId: string, boostType: 'time' | 'sell') {
    // Auto reset if new day
    const user = await this.checkAndResetDailyLimit(userId);

    // ⭐ เช็คว่าเกิน 2 ครั้งหรือยัง
    if (user.adBoosts.dailyAdsWatched >= this.MAX_DAILY_ADS) {
      throw new BadRequestException(
        'You have reached the daily ad limit (2 ads per day). Try again tomorrow!'
      );
    }

    // Apply boost
    if (boostType === 'time') {
      user.adBoosts.timeReductionAvailable = 30;
    } else {
      user.adBoosts.sellMultiplier = 2;
    }

    // ⭐ Update counters
    user.adBoosts.lastAdWatchedAt = new Date();
    user.adBoosts.dailyAdsWatched += 1;
    user.adBoosts.totalAdWatchCount += 1;

    await user.save();

    return {
      boostType,
      boostValue: boostType === 'time' ? 30 : 2,
      dailyAdsWatched: user.adBoosts.dailyAdsWatched,
      adsRemaining: this.MAX_DAILY_ADS - user.adBoosts.dailyAdsWatched,
      totalAdWatchCount: user.adBoosts.totalAdWatchCount,
    };
  }

  async getAdStatus(userId: string) {
    const user = await this.checkAndResetDailyLimit(userId);

    return {
      dailyAdsWatched: user.adBoosts.dailyAdsWatched,
      adsRemaining: this.MAX_DAILY_ADS - user.adBoosts.dailyAdsWatched,
      maxDailyAds: this.MAX_DAILY_ADS,
      canWatchAd: user.adBoosts.dailyAdsWatched < this.MAX_DAILY_ADS,
      lastAdWatchedAt: user.adBoosts.lastAdWatchedAt,
      totalAdWatchCount: user.adBoosts.totalAdWatchCount,
    };
  }
}
```

#### Create Controller:
```typescript
// src/ads/ads.controller.ts
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdsService } from './ads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Ads')
@Controller('ads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get('status')
  async getAdStatus(@CurrentUser() currentUser: any) {
    const status = await this.adsService.getAdStatus(currentUser.userId);
    return { success: true, data: status };
  }

  @Post('reward')
  async claimReward(
    @Body() dto: ClaimAdRewardDto,
    @CurrentUser() currentUser: any,
  ) {
    const result = await this.adsService.claimReward(
      currentUser.userId,
      dto.boostType,
    );
    return {
      success: true,
      message: 'Ad boost activated!',
      data: result,
    };
  }
}
```

---

## 🔒 Security (ป้องกัน Cheat):

### Level 1: Basic (ง่าย):
```typescript
// แค่เชื่อ Frontend
// เสี่ยง: User สามารถ bypass โดยยิง API ตรง
```

### Level 2: Rate Limiting (กลาง):
```typescript
@Throttle({ short: { limit: 5, ttl: 3600000 } })  // 5 ads per hour
@Post('reward')
```

### Level 3: Cooldown (กลาง):
```typescript
// เช็คว่าดู ad ล่าสุดเมื่อไหร่
const lastAdTime = user.lastAdWatchedAt;
const now = Date.now();

if (now - lastAdTime < 5 * 60 * 1000) {  // 5 minutes
  throw new BadRequestException('Please wait before watching next ad');
}

user.lastAdWatchedAt = now;
```

### Level 4: Verification Token (สูง):
```typescript
// AdMob/Unity Ads ส่ง server-to-server callback
// พร้อม verification token

async claimReward(userId: string, verificationToken: string) {
  // Verify token with ad network
  const isValid = await this.verifyWithAdNetwork(verificationToken);
  
  if (!isValid) {
    throw new BadRequestException('Invalid ad token');
  }
  
  // Apply reward
}
```

---

## 📊 Boost Usage Flow:

### Time Reduction Boost:
```typescript
// game.service.ts - plantTree()
const baseGrowTime = seed.baseGrowTime;
let growTime = baseGrowTime;

// Apply time reduction from upgrade
if (user.timeReductionUpgrade) {
  growTime *= 0.9;  // -10%
}

// Apply ad boost
if (user.adBoostTimeReduction > 0 && !user.adBoostUsed) {
  growTime -= user.adBoostTimeReduction;  // -30s
  
  // Mark as used
  user.adBoostUsed = true;
  await user.save();
}
```

### Sell Multiplier Boost:
```typescript
// game.service.ts - sellTree()
let sellPrice = seed.baseSellPrice * qualityMultiplier;

// Apply ad boost
if (user.adBoostSellMultiplier > 1 && !user.adBoostUsed) {
  sellPrice *= user.adBoostSellMultiplier;  // 2x
  
  // Mark as used
  user.adBoostUsed = true;
  user.adBoostSellMultiplier = 1;
  await user.save();
}
```

---

## 🎨 UI/UX Recommendations:

### Ad Button States:
```typescript
// Not available (cooldown)
<Button disabled>
  ⏰ Next ad in 3:45
</Button>

// Available
<Button>
  📺 Watch Ad → +2x Sell Price
</Button>

// Active boost
<Button disabled>
  ✅ Boost Active! (used on next sale)
</Button>
```

### Visual Indicators:
```typescript
// Show active boost
{user.adBoostSellMultiplier > 1 && (
  <Badge color="gold">
    🎁 2x SELL BOOST ACTIVE
  </Badge>
)}

{user.adBoostTimeReduction > 0 && (
  <Badge color="blue">
    ⚡ -30s TIME BOOST ACTIVE
  </Badge>
)}
```

---

## 📈 Analytics & Monetization:

### Track Metrics:
```typescript
// Frontend analytics
analytics.logEvent('ad_requested', { boostType: 'time' });
analytics.logEvent('ad_watched', { boostType: 'time' });
analytics.logEvent('ad_failed', { reason: 'no_fill' });

// Backend analytics
await this.analyticsService.track({
  userId,
  event: 'ad_reward_claimed',
  boostType,
  timestamp: new Date(),
});
```

### Revenue Optimization:
- **Rewarded Ads**: Best for idle games
- **Interstitial**: Between game sessions
- **Banner**: Passive income (low CPM)

---

## ✅ Recommended Setup:

### For MVP (เริ่มต้น):
1. ✅ Frontend: AdMob rewarded ads
2. ✅ Backend: Simple API endpoint
3. ✅ Basic cooldown (5 min)
4. ✅ Rate limiting (5 per hour)

### For Production (ระยะยาว):
1. ✅ Server-side verification
2. ✅ Analytics tracking
3. ✅ A/B testing ad placements
4. ✅ Multiple ad networks (mediation)

---

## 🎯 Summary:

**Frontend:**
- แสดงโฆษณา (AdMob/Unity Ads)
- Detect ad completion
- Call API เพื่อรับ reward

**Backend:**
- `/api/ads/reward` endpoint
- Validate & apply boost
- Track usage in DB
- Security (rate limit, cooldown)

**Schema (มีอยู่แล้ว):**
- adBoostTimeReduction
- adBoostSellMultiplier
- adBoostUsed

**Next Steps:**
1. เลือก ad network (AdMob แนะนำ)
2. สร้าง ads module
3. Integrate ใน game logic
4. Test & optimize

**พร้อมทำระบบโฆษณา!** 📺💰
