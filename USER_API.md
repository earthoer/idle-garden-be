# User API Documentation

## Base URL
```
http://localhost:3000/api/users
```

---

## Endpoints

### 1. Create User
**POST** `/api/users`

สร้าง user ใหม่ พร้อมกับ:
- Default location (Dirt Patch)
- Default seed (Tree A) unlocked
- เริ่มต้นด้วย gold = 0

**Request Body:**
```json
{
  "googleId": "google_123456",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "googleId": "google_123456",
    "email": "user@example.com",
    "name": "John Doe",
    "gold": 0,
    "totalEarnings": 0,
    "totalTreesSold": 0,
    "totalClicks": 0,
    "currentLocation": "507f1f77bcf86cd799439012",
    "unlockedLocations": ["507f1f77bcf86cd799439012"],
    "premiumSlots": 0,
    "unlockedSeeds": ["507f1f77bcf86cd799439013"],
    "collectionProgress": 1,
    "hasFairy": false,
    "hasNoAds": false,
    "clickPowerUpgrade": false,
    "timeReductionUpgrade": false,
    "adBoosts": {
      "timeReductionAvailable": 0,
      "sellMultiplier": 1,
      "lastAdWatchedAt": null
    },
    "longestCombo": 0,
    "rarestTreeSold": null,
    "lastLogin": "2026-01-30T14:00:00.000Z",
    "createdAt": "2026-01-30T14:00:00.000Z",
    "updatedAt": "2026-01-30T14:00:00.000Z"
  }
}
```

**Error (409 Conflict):**
```json
{
  "statusCode": 409,
  "message": "User with this Google ID or email already exists"
}
```

---

### 2. Get User by ID
**GET** `/api/users/:userId`

ดึงข้อมูล user พร้อม populate:
- currentLocation
- unlockedLocations
- unlockedSeeds

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "googleId": "google_123456",
    "email": "user@example.com",
    "name": "John Doe",
    "gold": 5000,
    "totalEarnings": 12000,
    "totalTreesSold": 15,
    "totalClicks": 250,
    "currentLocation": {
      "_id": "507f1f77bcf86cd799439012",
      "code": "greenhouse",
      "name": "Greenhouse",
      "icon": "🏡"
    },
    "unlockedLocations": [...],
    "unlockedSeeds": [...],
    ...
  }
}
```

---

### 3. Get User by Google ID
**GET** `/api/users/google/:googleId`

ดึงข้อมูล user ด้วย Google ID (สำหรับ login)

**Example:**
```
GET /api/users/google/google_123456
```

**Response:** เหมือน Get User by ID

---

### 4. Update User
**PATCH** `/api/users/:userId`

อัพเดทข้อมูล user (partial update)

**Request Body (ตัวอย่าง):**
```json
{
  "gold": 10000,
  "totalTreesSold": 20,
  "clickPowerUpgrade": true,
  "longestCombo": 15
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    ...
  }
}
```

---

### 5. Get Game State
**GET** `/api/users/:userId/state`

ดึงสถานะเกมทั้งหมดของ user รวมถึง:
- ข้อมูล user
- planted trees ทั้งหมด (พร้อม timeLeft)
- stats (slots)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "gold": 5000,
      ...
    },
    "plantedTrees": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "userId": "507f1f77bcf86cd799439011",
        "slotIndex": 0,
        "seedId": {
          "_id": "507f1f77bcf86cd799439013",
          "code": "tree_a",
          "name": "Tree A",
          "icon": "🌱"
        },
        "quality": "normal",
        "startTime": "2026-01-30T14:00:00.000Z",
        "endTime": "2026-01-30T14:05:00.000Z",
        "timeReduced": 0,
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

**Note:** 
- `timeLeft` คำนวณ real-time (seconds)
- `isReady` = true เมื่อ timeLeft = 0

---

### 6. Update Last Login
**POST** `/api/users/:userId/login`

อัพเดท lastLogin timestamp (เรียกเมื่อ user login)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Last login updated"
}
```

---

## Error Responses

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "name should not be empty"
  ],
  "error": "Bad Request"
}
```

---

## Usage Flow

### 1. สร้าง User ครั้งแรก (Registration)
```bash
POST /api/users
{
  "googleId": "google_123456",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### 2. Login (ดึงข้อมูล user)
```bash
GET /api/users/google/google_123456
```

### 3. ดึงสถานะเกม
```bash
GET /api/users/507f1f77bcf86cd799439011/state
```

### 4. อัพเดทข้อมูลหลังขายต้นไม้
```bash
PATCH /api/users/507f1f77bcf86cd799439011
{
  "gold": 10000,
  "totalEarnings": 15000,
  "totalTreesSold": 16
}
```

---

## Internal Service Methods

UsersService ยังมี methods เหล่านี้สำหรับใช้ใน Game Module:

```typescript
// เพิ่ม/ลด gold
await usersService.addGold(userId, 850);

// เพิ่มจำนวนต้นไม้ที่ขาย
await usersService.incrementTreesSold(userId);

// เพิ่มจำนวนคลิก
await usersService.incrementClicks(userId, 5);
```

---

## Testing with cURL

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "google_test_123",
    "email": "test@example.com",
    "name": "Test User"
  }'
```

### Get User
```bash
curl http://localhost:3000/api/users/USER_ID
```

### Get Game State
```bash
curl http://localhost:3000/api/users/USER_ID/state
```
