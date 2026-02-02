# Changelog - Image Assets Integration

## 🎨 Updated: Seed & Location Data

### Seeds
**Changed from:**
- tree_a, tree_b, tree_c... (10 generic trees)

**Changed to:**
- `bean_sprout` - Bean Sprout (ถั่วงอก)
- `lettuce` - Lettuce (ผักสลัด)

**Total: 2 seeds** (for testing)

---

### Locations
**Changed from:**
- dirt_patch, garden_bed, greenhouse... (10 locations)

**Changed to:**
- `waste_land` - Waste Land (ที่ดินรกร้าง)

**Total: 1 location** (for testing)

---

## 📦 Image Assets

### GitHub Repository
```
https://github.com/earthoer/image-deposit
```

### Image URL Pattern
```
Base: https://raw.githubusercontent.com/earthoer/image-deposit/main/

Seeds: /seeds/{code}/{code}_0{stage}.png
  - bean_sprout_01.png → bean_sprout_04.png
  - lettuce_01.png → lettuce_04.png

Locations: /locations/{code}/map.png
           /locations/{code}/pot_01.png
  - waste_land/map.png
  - waste_land/pot_01.png

Default: /dirt_plant.png (empty slot)
```

---

## 🔧 Technical Changes

### 1. No Paths in Database (Except Icon)
**Before:**
```typescript
{
  icon: '🌱',
  locationImageUrl: '/images/locations/dirt_patch.png',
  potImageUrl: '/images/pots/dirt_pot.png'
}
```

**After:**
```typescript
{
  code: 'bean_sprout',
  icon: '/seeds/bean_sprout/bean_sprout_04.png',  // Stage 4 image
  // No location/pot paths - Frontend calculates them
}
```

**Icon:** Uses fully grown image (stage 4 - _04.png)

### 2. Frontend Calculates Paths
```typescript
// Pattern-based URL generation
const imageUrl = `${BASE_URL}/seeds/${seed.code}/${seed.code}_0${stage}.png`;

// Example:
getSeedStageImage('bean_sprout', 1)
// → https://raw.githubusercontent.com/.../bean_sprout_01.png
```

### 3. Growth Stages
4 stages based on time progress:
- **Stage 1** (0-25%): bean_sprout_01.png
- **Stage 2** (25-50%): bean_sprout_02.png
- **Stage 3** (50-75%): bean_sprout_03.png
- **Stage 4** (75-100%): bean_sprout_04.png

---

## 📂 New Files

### Documentation
- ✅ `IMAGE_ASSETS.md` - Complete image asset guide
- ✅ `CHANGELOG.md` - This file

### Frontend Helpers
- ✅ `frontend-helpers/image-helpers.ts` - TypeScript helper functions
  - `getSeedStageImage(code, stage)`
  - `getLocationMap(code)`
  - `getLocationPot(code)`
  - `getDirtPlantImage()`
  - `calculateGrowthStage(startTime, endTime)`
  - `getCurrentSeedImage(code, startTime, endTime)`
  - `preloadImages(urls)`

---

## 🔄 Updated Files

### Seeds Data
**File:** `src/database/data/seeds.data.ts`

**Changes:**
- Reduced from 10 seeds to 2 seeds
- Changed codes: `tree_a` → `bean_sprout`, `tree_b` → `lettuce`
- Removed image path fields
- Added comment about path pattern

### Locations Data
**File:** `src/database/data/locations.data.ts`

**Changes:**
- Reduced from 10 locations to 1 location
- Changed code: `dirt_patch` → `waste_land`
- Updated locationImageUrl: `/locations/waste_land/map.png`
- Updated potImageUrl: `/locations/waste_land/pot_01.png`

### Users Service
**File:** `src/users/users.service.ts`

**Changes:**
- Default location: `dirt_patch` → `waste_land`
- Default seed: `tree_a` → `bean_sprout`

---

## 🎯 Usage Examples

### Get Seed Icon
```typescript
import { getSeedIcon } from './image-helpers';

// Get seed icon (fully grown - stage 4)
const iconUrl = getSeedIcon('bean_sprout');
// → https://raw.githubusercontent.com/.../bean_sprout_04.png
```

### Get Seed Image
```typescript
import { getSeedStageImage, calculateGrowthStage } from './image-helpers';

// Get stage 1 image
const stage1 = getSeedStageImage('bean_sprout', 1);
// → https://raw.githubusercontent.com/.../bean_sprout_01.png

// Calculate current stage from time
const stage = calculateGrowthStage(plantedTree.startTime, plantedTree.endTime);
const currentImage = getSeedStageImage('bean_sprout', stage);
```

### Get Location Images
```typescript
import { getLocationMap, getLocationPot } from './image-helpers';

const background = getLocationMap('waste_land');
// → https://raw.githubusercontent.com/.../waste_land/map.png

const pot = getLocationPot('waste_land');
// → https://raw.githubusercontent.com/.../waste_land/pot_01.png
```

### React Component
```tsx
function PlantView({ plantedTree }) {
  const stage = calculateGrowthStage(
    plantedTree.startTime, 
    plantedTree.endTime
  );
  
  const imageUrl = getSeedStageImage(plantedTree.seedId.code, stage);
  
  return <img src={imageUrl} alt="Plant" />;
}
```

---

## 🧪 Testing

### Verify Images Load
```bash
# Bean Sprout Stage 1
curl -I https://raw.githubusercontent.com/earthoer/image-deposit/main/seeds/bean_sprout/bean_sprout_01.png

# Lettuce Stage 4
curl -I https://raw.githubusercontent.com/earthoer/image-deposit/main/seeds/lettuce/lettuce_04.png

# Waste Land Map
curl -I https://raw.githubusercontent.com/earthoer/image-deposit/main/locations/waste_land/map.png

# Dirt Plant
curl -I https://raw.githubusercontent.com/earthoer/image-deposit/main/dirt_plant.png
```

### Run New Seed Script
```bash
npm run seed
```

**Expected Output:**
```
✅ Inserted 2 seeds
✅ Inserted 1 locations
```

---

## 📊 Database Impact

### Before
- 10 seeds in database
- 10 locations in database
- Image paths stored in DB

### After
- 2 seeds in database
- 1 location in database
- No image paths in DB
- Paths calculated by Frontend

### Migration Required
```bash
# Clear old data and reseed
npm run seed
```

---

## 🚀 Next Steps

1. **Add More Seeds:**
   - Add folders to GitHub repo
   - Add entries to `seeds.data.ts`
   - Run seed script

2. **Add More Locations:**
   - Add folders to GitHub repo
   - Add entries to `locations.data.ts`
   - Run seed script

3. **Frontend Integration:**
   - Copy `image-helpers.ts` to Frontend
   - Use helper functions to load images
   - Implement growth stage visualization

---

## ✅ Summary

**What Changed:**
- ✅ Seeds: 10 → 2 (bean_sprout, lettuce)
- ✅ Locations: 10 → 1 (waste_land)
- ✅ Images: GitHub-hosted, pattern-based URLs
- ✅ Database: No image paths stored
- ✅ Frontend: Helper functions provided

**Benefits:**
- 🎯 Cleaner database (no hardcoded paths)
- 🚀 Easy to add new assets (just add to GitHub)
- 📦 Centralized image hosting
- 🔄 Flexible image updates (change GitHub, no DB update needed)
- 💾 Smaller database size

**Ready for Testing!** 🎉
