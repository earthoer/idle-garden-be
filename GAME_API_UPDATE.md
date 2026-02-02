# Game API Update - Remove userId from Request Body

## 🎯 Changes:

**Before:** Game endpoints required userId in request body
**After:** Game endpoints use userId from JWT token automatically

## ✅ Benefits:

1. **Security** - Prevents userId spoofing
2. **Simpler** - Frontend doesn't need to send userId
3. **Clean API** - Shorter request body
4. **Automatic** - userId from verified JWT

## 📝 API Changes:

### POST /api/game/plant

**Before:**
```json
{
  "userId": "697dd77a7460c044869d03f2",
  "seedId": "507f1f77bcf86cd799439013",
  "slotIndex": 0
}
```

**After:**
```json
{
  "seedId": "507f1f77bcf86cd799439013",
  "slotIndex": 0
}
```

### POST /api/game/click

**Before:**
```json
{
  "userId": "697dd77a7460c044869d03f2",
  "plantedTreeId": "507f1f77bcf86cd799439014",
  "timeReduction": 1
}
```

**After:**
```json
{
  "plantedTreeId": "507f1f77bcf86cd799439014",
  "timeReduction": 1
}
```

### POST /api/game/sell

**Before:**
```json
{
  "userId": "697dd77a7460c044869d03f2",
  "plantedTreeId": "507f1f77bcf86cd799439014"
}
```

**After:**
```json
{
  "plantedTreeId": "507f1f77bcf86cd799439014"
}
```

## 💻 Frontend Code:

**Before:**
```javascript
await plantTree({
  userId: userId,
  seedId: seedId,
  slotIndex: 0
});
```

**After:**
```javascript
await plantTree({
  seedId: seedId,
  slotIndex: 0
});
```

userId is automatically extracted from JWT token!
