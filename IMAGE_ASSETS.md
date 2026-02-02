# Image Assets - GitHub Integration Guide

## 📦 GitHub Repository
```
https://github.com/earthoer/image-deposit
```

## 🌐 Base URL for Images
```
https://raw.githubusercontent.com/earthoer/image-deposit/main/
```

---

## 🌱 Seeds Image Pattern

### Directory Structure
```
seeds/
├── bean_sprout/
│   ├── bean_sprout_01.png  (stage 1 - เพิ่งงอก)
│   ├── bean_sprout_02.png  (stage 2 - กำลังโต)
│   ├── bean_sprout_03.png  (stage 3 - ใกล้โต)
│   └── bean_sprout_04.png  (stage 4 - โตเต็มวัย)
└── lettuce/
    ├── lettuce_01.png
    ├── lettuce_02.png
    ├── lettuce_03.png
    └── lettuce_04.png
```

### Image URL Pattern
```javascript
const BASE_URL = 'https://raw.githubusercontent.com/earthoer/image-deposit/main';

// Function to get seed growth stage image
function getSeedStageImage(seedCode, stage) {
  return `${BASE_URL}/seeds/${seedCode}/${seedCode}_0${stage}.png`;
}

// Function to get seed icon (stage 4 - fully grown)
function getSeedIcon(seedCode) {
  return getSeedStageImage(seedCode, 4);
}

// Examples:
getSeedStageImage('bean_sprout', 1)
// → https://raw.githubusercontent.com/earthoer/image-deposit/main/seeds/bean_sprout/bean_sprout_01.png

getSeedIcon('bean_sprout')
// → https://raw.githubusercontent.com/earthoer/image-deposit/main/seeds/bean_sprout/bean_sprout_04.png

getSeedStageImage('lettuce', 4)
// → https://raw.githubusercontent.com/earthoer/image-deposit/main/seeds/lettuce/lettuce_04.png
```

### Available Seeds
- `bean_sprout` - Bean Sprout (ถั่วงอก)
- `lettuce` - Lettuce (ผักสลัด)

---

## 📍 Locations Image Pattern

### Directory Structure
```
locations/
└── waste_land/
    ├── map.png      (background image)
    └── pot_01.png   (pot/planter image)
```

### Image URL Pattern
```javascript
// Function to get location background
function getLocationBackground(locationCode) {
  return `${BASE_URL}/locations/${locationCode}/map.png`;
}

// Function to get location pot
function getLocationPot(locationCode) {
  return `${BASE_URL}/locations/${locationCode}/pot_01.png`;
}

// Examples:
getLocationBackground('waste_land')
// → https://raw.githubusercontent.com/earthoer/image-deposit/main/locations/waste_land/map.png

getLocationPot('waste_land')
// → https://raw.githubusercontent.com/earthoer/image-deposit/main/locations/waste_land/pot_01.png
```

### Available Locations
- `waste_land` - Waste Land (ที่ดินรกร้าง)

---

## 🪴 Default Plant (Dirt Plant)

### Special Case
```
dirt_plant.png  (root level - ดินพึ่งปลูก/empty slot)
```

### Image URL
```javascript
// Default plant image (when slot is empty or just planted)
const dirtPlantImage = `${BASE_URL}/dirt_plant.png`;
// → https://raw.githubusercontent.com/earthoer/image-deposit/main/dirt_plant.png
```

---

## 💻 Frontend Implementation

### React/React Native Example

```typescript
// constants/images.ts
export const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/earthoer/image-deposit/main';

export const getAssetUrl = {
  // Seed growth stages
  seedStage: (code: string, stage: number) => 
    `${IMAGE_BASE_URL}/seeds/${code}/${code}_0${stage}.png`,
  
  // Location images
  locationMap: (code: string) => 
    `${IMAGE_BASE_URL}/locations/${code}/map.png`,
  
  locationPot: (code: string) => 
    `${IMAGE_BASE_URL}/locations/${code}/pot_01.png`,
  
  // Default dirt plant
  dirtPlant: () => 
    `${IMAGE_BASE_URL}/dirt_plant.png`,
};

// Usage:
import { getAssetUrl } from './constants/images';

// In component:
<Image source={{ uri: getAssetUrl.seedStage('bean_sprout', 1) }} />
<Image source={{ uri: getAssetUrl.locationMap('waste_land') }} />
<Image source={{ uri: getAssetUrl.dirtPlant() }} />
```

### Calculate Stage from Time

```typescript
// Calculate which stage to show based on progress
function getCurrentStage(plantedTree) {
  const now = Date.now();
  const totalTime = plantedTree.endTime - plantedTree.startTime;
  const elapsed = now - plantedTree.startTime;
  const progress = Math.min(elapsed / totalTime, 1);
  
  // 4 stages: 0-25%, 25-50%, 50-75%, 75-100%
  if (progress < 0.25) return 1;
  if (progress < 0.50) return 2;
  if (progress < 0.75) return 3;
  return 4;
}

// Usage:
const stage = getCurrentStage(plantedTree);
const imageUrl = getAssetUrl.seedStage(plantedTree.seedId.code, stage);
```

### Complete Component Example

```typescript
// PlantedTreeView.tsx
import React from 'react';
import { Image, View } from 'react-native';
import { getAssetUrl } from './constants/images';

interface PlantedTreeViewProps {
  plantedTree: PlantedTree;
}

export const PlantedTreeView: React.FC<PlantedTreeViewProps> = ({ plantedTree }) => {
  const stage = getCurrentStage(plantedTree);
  const seedCode = plantedTree.seedId.code;
  const locationCode = plantedTree.locationCode;
  
  return (
    <View style={styles.container}>
      {/* Background */}
      <Image 
        source={{ uri: getAssetUrl.locationMap(locationCode) }}
        style={styles.background}
      />
      
      {/* Pot */}
      <Image 
        source={{ uri: getAssetUrl.locationPot(locationCode) }}
        style={styles.pot}
      />
      
      {/* Plant */}
      <Image 
        source={{ uri: getAssetUrl.seedStage(seedCode, stage) }}
        style={styles.plant}
      />
    </View>
  );
};
```

---

## 🎨 Image Specifications

### Seed Images
- **Format**: PNG with transparency
- **Stages**: 4 stages (_01 to _04)
- **Naming**: `{seed_code}_0{stage}.png`
- **Purpose**: Show growth progression
- **Icon**: Uses stage 4 image (_04.png) - fully grown

### Seed Icon in Database
```typescript
// Database stores icon as relative path
{
  code: 'bean_sprout',
  icon: '/seeds/bean_sprout/bean_sprout_04.png',
  // Frontend adds BASE_URL to get full URL
}
```

### Location Images
- **map.png**: Background/environment
- **pot_01.png**: Container/planter
- **Format**: PNG

### Dirt Plant
- **Purpose**: Default empty slot indicator
- **Single image**: No stages

---

## 🔄 Adding New Assets

### Adding New Seed

1. Create folder: `seeds/new_seed_name/`
2. Add 4 images:
   - `new_seed_name_01.png`
   - `new_seed_name_02.png`
   - `new_seed_name_03.png`
   - `new_seed_name_04.png`
3. Add to database seed script with `code: 'new_seed_name'`

### Adding New Location

1. Create folder: `locations/new_location/`
2. Add 2 images:
   - `map.png`
   - `pot_01.png`
3. Add to database seed script with `code: 'new_location'`

---

## 📊 Current Assets

### Seeds (2):
✅ bean_sprout (4 stages)
✅ lettuce (4 stages)

### Locations (1):
✅ waste_land (map + pot)

### Special:
✅ dirt_plant.png (default)

---

## 🚀 Testing Images

### Quick Test URLs

**Bean Sprout Stage 1:**
```
https://raw.githubusercontent.com/earthoer/image-deposit/main/seeds/bean_sprout/bean_sprout_01.png
```

**Lettuce Stage 4:**
```
https://raw.githubusercontent.com/earthoer/image-deposit/main/seeds/lettuce/lettuce_04.png
```

**Waste Land Map:**
```
https://raw.githubusercontent.com/earthoer/image-deposit/main/locations/waste_land/map.png
```

**Dirt Plant:**
```
https://raw.githubusercontent.com/earthoer/image-deposit/main/dirt_plant.png
```

---

## 💡 Best Practices

1. **Cache Images**: Use image caching library in mobile app
2. **Preload**: Preload common images on app start
3. **Fallback**: Have fallback emoji/placeholder if image fails to load
4. **Progressive**: Show lower quality/placeholder while loading

---

## 🎯 Summary

**No paths stored in database!** 

Frontend calculates paths using:
- Seed code + stage number
- Location code + image type (map/pot)

**Simple pattern:**
```
/seeds/{code}/{code}_0{stage}.png
/locations/{code}/map.png
/locations/{code}/pot_01.png
/dirt_plant.png
```
