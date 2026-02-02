# Ad Daily Limit System - วันละ 2 ครั้ง

## 🎯 ระบบจำกัดโฆษณา:

**กฎ:** ดูโฆษณาได้วันละ **2 ครั้ง**
**Reset:** ทุกวันเวลา 00:00 (midnight)

---

## 📊 Database Schema:

### User Schema - AdBoosts:
```typescript
adBoosts: {
  timeReductionAvailable: number;     // Boost value
  sellMultiplier: number;             // Boost value
  lastAdWatchedAt: Date;              // ⭐ เวลาดู ad ล่าสุด
  dailyAdsWatched: number;            // ⭐ จำนวนครั้งวันนี้ (0-2)
  totalAdWatchCount: number;          // ⭐ รวมทั้งหมด (all time)
}
```

---

## 🔄 Flow:

### 1. Frontend เช็คก่อนแสดง Ad:
```typescript
// GET /api/ads/status
const status = await fetch('/api/ads/status', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { canWatchAd, adsRemaining } = await status.json();

if (!canWatchAd) {
  showMessage(`คุณดูโฆษณาครบแล้ววันนี้! กลับมาพรุ่งนี้นะ 😊`);
  return;
}

// แสดงโฆษณา
showAd();
```

### 2. User ดูโฆษณาจบ → ยิง API:
```typescript
// POST /api/ads/reward
const result = await fetch('/api/ads/reward', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ boostType: 'time' })
});

const data = await result.json();
// {
//   dailyAdsWatched: 1,
//   adsRemaining: 1,
//   totalAdWatchCount: 15
// }
```

### 3. Backend ทำงาน:
```typescript
1. เช็คว่าเป็นวันใหม่หรือไม่
   → ถ้าใช่: dailyAdsWatched = 0
   
2. เช็ค dailyAdsWatched >= 2?
   → ถ้าใช่: throw error "ดูครบแล้ว"
   → ถ้าไม่: ดำเนินการต่อ
   
3. Apply boost + Update:
   - lastAdWatchedAt = now
   - dailyAdsWatched += 1
   - totalAdWatchCount += 1
   - save to DB
```

---

## 🔧 Backend Implementation:

### Check New Day Logic:
```typescript
private isNewDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() !== d2.getFullYear() ||
    d1.getMonth() !== d2.getMonth() ||
    d1.getDate() !== d2.getDate()
  );
}
```

### Auto Reset:
```typescript
async checkAndResetDailyLimit(userId: string): Promise<User> {
  const user = await this.userModel.findById(userId);
  const now = new Date();
  const lastAdDate = user.adBoosts?.lastAdWatchedAt;

  // เช็คว่าเป็นวันใหม่หรือไม่
  if (lastAdDate && this.isNewDay(lastAdDate, now)) {
    user.adBoosts.dailyAdsWatched = 0;  // ⭐ Reset!
    await user.save();
  }

  return user;
}
```

### Claim Reward:
```typescript
async claimReward(userId: string, boostType: BoostType) {
  // Auto reset if new day
  const user = await this.checkAndResetDailyLimit(userId);

  // ⭐ เช็คว่าดูครบ 2 ครั้งหรือยัง
  if (user.adBoosts.dailyAdsWatched >= 2) {
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
    dailyAdsWatched: user.adBoosts.dailyAdsWatched,
    adsRemaining: 2 - user.adBoosts.dailyAdsWatched,
    totalAdWatchCount: user.adBoosts.totalAdWatchCount,
  };
}
```

---

## 📱 Frontend UI Examples:

### Show Ad Button Status:
```typescript
function AdButton({ status }) {
  if (!status.canWatchAd) {
    return (
      <Button disabled>
        ⏰ Daily limit reached (2/2)
        <Text>Come back tomorrow!</Text>
      </Button>
    );
  }
  
  return (
    <Button onPress={watchAd}>
      📺 Watch Ad ({status.dailyAdsWatched}/2)
      <Text>{status.adsRemaining} remaining today</Text>
    </Button>
  );
}
```

### Show Stats:
```typescript
<View>
  <Text>Today: {status.dailyAdsWatched}/2 ads</Text>
  <Text>All Time: {status.totalAdWatchCount} ads watched</Text>
  <Text>Last watched: {formatDate(status.lastAdWatchedAt)}</Text>
</View>
```

---

## 🧪 API Endpoints:

### GET /api/ads/status
**Get ad watching status**

**Response:**
```json
{
  "success": true,
  "data": {
    "dailyAdsWatched": 1,
    "adsRemaining": 1,
    "maxDailyAds": 2,
    "canWatchAd": true,
    "lastAdWatchedAt": "2026-02-01T10:30:00.000Z",
    "totalAdWatchCount": 15,
    "activeBoosts": {
      "timeReduction": 30,
      "sellMultiplier": 1
    }
  }
}
```

### POST /api/ads/reward
**Claim ad reward after watching**

**Request:**
```json
{
  "boostType": "time"  // or "sell"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Time reduction boost activated!",
  "data": {
    "boostType": "time",
    "boostValue": 30,
    "dailyAdsWatched": 2,
    "adsRemaining": 0,
    "totalAdWatchCount": 16
  }
}
```

**Response (Daily Limit):**
```json
{
  "statusCode": 400,
  "message": "You have reached the daily ad limit (2 ads per day). Try again tomorrow!"
}
```

---

## ⏰ Reset Schedule:

### Midnight Reset (00:00):
```
23:59 → dailyAdsWatched = 2 (limit reached)
00:00 → New day starts
00:01 → User opens app
      → checkAndResetDailyLimit() runs
      → dailyAdsWatched = 0 ✅
      → Can watch ads again!
```

### Example Timeline:
```
Day 1:
10:00 → Watch ad #1 (dailyAdsWatched = 1)
15:00 → Watch ad #2 (dailyAdsWatched = 2)
20:00 → Try to watch → ❌ Daily limit reached

Day 2:
09:00 → Open app → Auto reset → dailyAdsWatched = 0
09:30 → Watch ad #1 (dailyAdsWatched = 1) ✅
```

---

## 🎯 Best Practices:

### 1. Always Check Status First:
```typescript
// ❌ Don't do this
showAd(); // อาจเกิน limit

// ✅ Do this
const status = await getAdStatus();
if (status.canWatchAd) {
  showAd();
} else {
  showMessage('Daily limit reached!');
}
```

### 2. Handle Errors:
```typescript
try {
  await claimAdReward('time');
} catch (error) {
  if (error.status === 400) {
    showMessage('Daily limit reached! Come back tomorrow 😊');
  }
}
```

### 3. Show User Feedback:
```typescript
// แสดงจำนวนที่เหลือ
<Badge>{adsRemaining} ads left today</Badge>

// แสดง progress
<ProgressBar 
  current={dailyAdsWatched} 
  max={2} 
/>

// แสดง stats
<Text>🎉 You've watched {totalAdWatchCount} ads!</Text>
```

---

## 🔒 Security:

### Rate Limiting (Already Applied):
```typescript
@Throttle({ short: { limit: 5, ttl: 3600000 } })
// Max 5 requests per hour (extra protection)
```

### Validation:
- ✅ JWT required (only logged-in users)
- ✅ Daily limit check (2 per day)
- ✅ Auto reset (new day)
- ✅ Counter tracking (total + daily)

---

## 📊 Analytics:

### Track Metrics:
```typescript
// Database query
const stats = await userModel.aggregate([
  {
    $group: {
      _id: null,
      totalAdsWatched: { $sum: '$adBoosts.totalAdWatchCount' },
      avgAdsPerUser: { $avg: '$adBoosts.totalAdWatchCount' },
      activeUsers: { $sum: { $cond: [{ $gt: ['$adBoosts.totalAdWatchCount', 0] }, 1, 0] } }
    }
  }
]);

// Results:
// totalAdsWatched: 1,234
// avgAdsPerUser: 12.3
// activeUsers: 100
```

---

## ✅ Summary:

**Features:**
- ✅ วันละ 2 ครั้ง (hard limit)
- ✅ Auto reset ทุกวันเที่ยงคืน
- ✅ เก็บ lastAdWatchedAt
- ✅ นับ dailyAdsWatched (รายวัน)
- ✅ นับ totalAdWatchCount (ทั้งหมด)
- ✅ API endpoint: GET /ads/status, POST /ads/reward

**Flow:**
1. เช็ค status ก่อนแสดง ad
2. ถ้า canWatchAd = true → แสดง ad
3. ดูจบ → POST /ads/reward
4. Backend +1 daily, +1 total, update lastAdWatchedAt
5. ถ้าวันใหม่ → auto reset dailyAdsWatched = 0

**Database:**
```
adBoosts: {
  lastAdWatchedAt: Date,      // เวลาล่าสุด
  dailyAdsWatched: number,    // วันนี้ (0-2)
  totalAdWatchCount: number   // ทั้งหมด
}
```

**พร้อมใช้งาน!** 📺✨
