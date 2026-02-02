# Idle Garden - Complete API Documentation

## 🚀 Quick Start

### Start Server
```bash
npm run start:dev
```

### Access Points
- **API Base:** `http://localhost:3000/api`
- **Swagger UI:** `http://localhost:3000/api/docs` ⭐
- **Health Check:** `http://localhost:3000/api/health`

---

## 📚 API Endpoints Overview

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Start Google OAuth login |
| GET | `/api/auth/google/callback` | OAuth callback (auto) |
| GET | `/api/auth/profile` | Get user from JWT token |
| GET | `/api/auth/status` | Check auth service status |

### 👤 Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create new user |
| GET | `/api/users/:userId` | Get user by ID |
| GET | `/api/users/google/:googleId` | Get user by Google ID |
| PATCH | `/api/users/:userId` | Update user |
| GET | `/api/users/:userId/state` | Get complete game state |
| POST | `/api/users/:userId/login` | Update last login |

### 🌱 Seeds
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seeds` | Get all seeds |
| GET | `/api/seeds/available?gold=X&totalTreesSold=Y` | Get unlockable seeds |
| GET | `/api/seeds/:seedId` | Get seed by ID |

### 📍 Locations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations` | Get all locations |
| GET | `/api/locations/available?gold=X` | Get affordable locations |
| GET | `/api/locations/:locationId` | Get location by ID |

### 🎮 Game
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/game/plant` | Plant a tree |
| POST | `/api/game/click` | Water tree (reduce time) |
| POST | `/api/game/sell` | Sell ready tree |

---

## 🎯 Common Workflows

### 1. User Registration & Login

```bash
# 1. User clicks "Login with Google"
#    Frontend redirects to:
GET http://localhost:3000/api/auth/google

# 2. Google OAuth flow happens automatically
#    User logs in, authorizes app

# 3. Callback with token
#    Redirects to: http://localhost:3001/auth/callback?token=JWT_TOKEN

# 4. Frontend stores token
localStorage.setItem('access_token', token);

# 5. Get game state
GET http://localhost:3000/api/users/USER_ID/state
Headers: Authorization: Bearer JWT_TOKEN
```

### 2. Plant → Water → Sell Flow

```bash
# 1. Get available seeds
GET /api/seeds/available?gold=1000&totalTreesSold=5

# 2. Plant a tree (userId from JWT token)
POST /api/game/plant
Headers: Authorization: Bearer JWT_TOKEN
{
  "seedId": "507f1f77bcf86cd799439013",
  "slotIndex": 0
}

# 3. Water tree multiple times (batch with combo)
POST /api/game/click
Headers: Authorization: Bearer JWT_TOKEN
{
  "plantedTreeId": "507f1f77bcf86cd799439014",
  "clicks": 10,
  "timeReduction": 17
}

# 4. Sell when ready
POST /api/game/sell
Headers: Authorization: Bearer JWT_TOKEN
{
  "plantedTreeId": "507f1f77bcf86cd799439014"
}
```

---

## 📖 Detailed Endpoints

### POST /api/game/plant

**Plant a new tree in a slot**

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Request Body:**
```json
{
  "seedId": "507f1f77bcf86cd799439013",
  "slotIndex": 0
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tree planted successfully",
  "data": {
    "plantedTree": {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "697dd77a7460c044869d03f2",
      "seedId": {
        "code": "bean_sprout",
        "name": "Bean Sprout",
        "basePrice": 0,
        "baseSellPrice": 100,
        "baseGrowTime": 300
      },
      "slotIndex": 0,
      "quality": "normal",
      "startTime": "2026-01-31T10:00:00.000Z",
      "endTime": "2026-01-31T10:05:00.000Z",
      "timeReduced": 0
    },
    "user": {
      "gold": 0,
      "totalSlots": 1
    }
  }
}
```

**Errors:**
- `400` - Not enough gold
- `400` - Slot already occupied
- `400` - Invalid slot index
- `401` - Unauthorized (no JWT token)
- `404` - User or seed not found

---

### POST /api/game/click

**Water tree (batch clicks with combo bonus) to reduce grow time**

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Request Body:**
```json
{
  "plantedTreeId": "507f1f77bcf86cd799439014",
  "clicks": 10,
  "timeReduction": 17
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Watered tree 10 times (17s reduced)",
  "data": {
    "plantedTree": {
      "_id": "507f1f77bcf86cd799439014",
      "timeReduced": 27,
      "endTime": "2026-01-31T10:04:43.000Z"
    },
    "timeLeft": 283,
    "isReady": false,
    "clicksProcessed": 10,
    "timeReduced": 17,
    "totalClicks": 160
  }
}
```

**Combo System (Frontend):**
```typescript
// Example calculation
function calculateComboReduction(clicks: number): number {
  let total = 0;
  for (let i = 0; i < clicks; i++) {
    let reduction = 1;  // Base 1s per click
    
    if (i >= 20) reduction *= 3;      // 3x at 20+ combo
    else if (i >= 10) reduction *= 2;  // 2x at 10+ combo
    else if (i >= 5) reduction *= 1.5; // 1.5x at 5+ combo
    
    total += reduction;
  }
  return Math.floor(total);
}
```

**Limits:**
- Min: 1 click, 1s reduction
- Max: 100 clicks, 1000s reduction
- Anti-cheat: Max 10s per click

**Errors:**
- `400` - Tree already ready
- `400` - Time reduction too high (anti-cheat)
- `400` - Tree doesn't belong to user
- `401` - Unauthorized (no JWT token)
- `404` - User or tree not found

---

### POST /api/game/sell

**Sell a ready tree**

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Request Body:**
```json
{
  "plantedTreeId": "507f1f77bcf86cd799439014"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sold Bean Sprout (golden) for 200g",
  "data": {
    "soldPrice": 200,
    "quality": "golden",
    "seedName": "Bean Sprout",
    "user": {
      "gold": 200,
      "totalEarnings": 200,
      "totalTreesSold": 1
    }
  }
}
```

**Quality Multipliers:**
- `withered`: 0.5x (50%)
- `normal`: 1x (100%)
- `golden`: 2x (200%)
- `rainbow`: 5x (500%)

**Errors:**
- `400` - Tree not ready yet
- `400` - Tree doesn't belong to user
- `401` - Unauthorized (no JWT token)
- `404` - User or tree not found

---

### GET /api/seeds

**Get all seeds**

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "code": "tree_a",
      "name": "Tree A",
      "basePrice": 0,
      "baseSellPrice": 100,
      "baseGrowTime": 300,
      "unlockRequirement": {
        "type": "default",
        "value": 0
      },
      "icon": "🌱",
      "description": "A simple starter tree. Free to plant!",
      "isEvent": false
    },
    ...
  ],
  "count": 10
}
```

---

### GET /api/seeds/available

**Get seeds available for user based on progress**

**Query Parameters:**
- `gold`: User's current gold
- `totalTreesSold`: User's total trees sold

**Example:**
```
GET /api/seeds/available?gold=5000&totalTreesSold=25
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    // Only seeds user can unlock
  ],
  "count": 5
}
```

---

### GET /api/locations

**Get all locations**

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "code": "dirt_patch",
      "name": "Dirt Patch",
      "price": 0,
      "order": 1,
      "bonusType": "click_speed",
      "bonusValue": 0,
      "bonusMultiplier": 1.0,
      "icon": "🏜️",
      "description": "A simple patch of dirt. No bonuses.",
      "locationImageUrl": "/images/locations/dirt_patch.png",
      "potImageUrl": "/images/pots/dirt_pot.png"
    },
    ...
  ],
  "count": 10
}
```

---

### GET /api/users/:userId/state

**Get complete game state**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "697dd77a7460c044869d03f2",
      "email": "earthgodna@gmail.com",
      "name": "...",
      "gold": 1500,
      "totalEarnings": 5000,
      "totalTreesSold": 15,
      "totalClicks": 250,
      "currentLocation": { ... },
      "unlockedLocations": [ ... ],
      "unlockedSeeds": [ ... ],
      "premiumSlots": 0,
      "hasFairy": false,
      "hasNoAds": false,
      "clickPowerUpgrade": false,
      "timeReductionUpgrade": false,
      "adBoosts": {
        "timeReductionAvailable": 0,
        "sellMultiplier": 1,
        "lastAdWatchedAt": null
      }
    },
    "plantedTrees": [
      {
        "_id": "...",
        "seedId": { ... },
        "slotIndex": 0,
        "quality": "normal",
        "timeLeft": 120,
        "isReady": false
      }
    ],
    "stats": {
      "totalSlots": 1,
      "occupiedSlots": 1,
      "availableSlots": 0
    }
  }
}
```

---

## 🧪 Testing with cURL

### Plant Tree
```bash
curl -X POST http://localhost:3000/api/game/plant \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seedId": "SEED_ID",
    "slotIndex": 0
  }'
```

### Click Tree
```bash
curl -X POST http://localhost:3000/api/game/click \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plantedTreeId": "TREE_ID",
    "clicks": 10,
    "timeReduction": 17
  }'
```

### Sell Tree
```bash
curl -X POST http://localhost:3000/api/game/sell \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plantedTreeId": "TREE_ID"
  }'
```

### Get Game State
```bash
curl http://localhost:3000/api/users/USER_ID/state \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎨 Swagger UI

**Access interactive API documentation:**
```
http://localhost:3000/api/docs
```

**Features:**
- ✅ Try out endpoints directly
- ✅ See request/response examples
- ✅ Test authentication
- ✅ View all schemas
- ✅ Export API specs

---

## 🔑 Authentication

Most endpoints don't require authentication for testing, but production should use JWT:

```bash
# Add JWT to protected endpoints
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Game Mechanics Summary

### Tree Quality Chances
- **Normal**: 84% (1x price)
- **Golden**: 10% (2x price)
- **Withered**: 5% (0.5x price)
- **Rainbow**: 1% (5x price)

### Slot System
- **Default**: 1 slot (free)
- **Premium**: Up to 4 additional slots (total 5)

### Upgrades
- **Click Power**: +1s per click
- **Time Reduction**: -10% grow time
- **Fairy**: Passive income
- **No Ads**: Remove ads

### Ad Boosts
- **Time Reduction**: Use available boosts
- **Sell Multiplier**: 2x sell price (one-time)

---

## 🚨 Common Errors

### 400 Bad Request
- Not enough gold
- Slot occupied
- Tree not ready
- Invalid parameters

### 404 Not Found
- User doesn't exist
- Seed doesn't exist
- Tree doesn't exist

### 409 Conflict
- User already exists (duplicate email/googleId)

---

## 📱 Frontend Integration

### Initialize
```javascript
const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('access_token');
const userId = localStorage.getItem('user_id');
```

### Get Game State
```javascript
async function getGameState() {
  const response = await fetch(`${API_URL}/users/${userId}/state`);
  return response.json();
}
```

### Plant Tree
```javascript
async function plantTree(seedId, slotIndex) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/game/plant`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ seedId, slotIndex })
  });
  return response.json();
}
```

### Click Tree
```javascript
// Calculate combo bonus
function calculateComboReduction(clicks) {
  let total = 0;
  for (let i = 0; i < clicks; i++) {
    let reduction = 1;  // Base 1s per click
    
    if (i >= 20) reduction *= 3;
    else if (i >= 10) reduction *= 2;
    else if (i >= 5) reduction *= 1.5;
    
    total += reduction;
  }
  return Math.floor(total);
}

async function waterTree(plantedTreeId, clicks) {
  const token = localStorage.getItem('access_token');
  const timeReduction = calculateComboReduction(clicks);
  
  const response = await fetch(`${API_URL}/game/click`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ 
      plantedTreeId, 
      clicks,
      timeReduction  // ส่งค่าที่คำนวณแล้ว
    })
  });
  return response.json();
}

// Optimistic update with debounce
let pendingClicks = 0;
let debounceTimer = null;

function handleClick(treeId) {
  pendingClicks++;
  
  // Clear existing timer
  if (debounceTimer) clearTimeout(debounceTimer);
  
  // Set new timer (5 seconds)
  debounceTimer = setTimeout(async () => {
    await waterTree(treeId, pendingClicks);
    pendingClicks = 0;
  }, 5000);
}
```

### Sell Tree
```javascript
async function sellTree(plantedTreeId) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/game/sell`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ plantedTreeId })
  });
  return response.json();
}
```

---

## ✅ Complete API Checklist

- ✅ Google OAuth + JWT Auth
- ✅ User Management (CRUD)
- ✅ Seeds (GET with filters)
- ✅ Locations (GET with filters)
- ✅ Plant Trees
- ✅ Water Trees (Click)
- ✅ Sell Trees
- ✅ Game State
- ✅ Swagger Documentation

**Backend is complete and ready for testing!** 🎉
