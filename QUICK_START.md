# 🚀 Idle Garden Backend - Quick Start Guide

## ✅ ทุกอย่างพร้อมใช้งานแล้ว!

Backend สมบูรณ์ 100% พร้อม:
- ✅ Google OAuth + JWT Authentication
- ✅ User Management (6 endpoints)
- ✅ Seeds Module (3 endpoints)
- ✅ Locations Module (3 endpoints)  
- ✅ Game Module (plant, click, sell)
- ✅ Swagger Documentation
- ✅ 10 Seeds + 10 Locations seeded
- ✅ MongoDB Atlas connected

---

## 📦 ขั้นตอนการติดตั้ง

### 1. แตกไฟล์และติดตั้ง dependencies

```bash
cd idle-garden-backend
npm install
```

### 2. ตรวจสอบ .env (ตั้งค่าแล้ว)

```env
# ✅ MongoDB Atlas - Connected
MONGODB_URI=mongodb+srv://earth_tree:...@idle-garden.ye7kzex.mongodb.net/idle-garden

# ✅ Google OAuth - Configured  
GOOGLE_CLIENT_ID=1067650075266-pt73cvurh0ip2h0ptuoki0lvqdmc7len.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# ✅ JWT - Ready
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...
```

### 3. Run Seed Script (ถ้ายังไม่ได้รัน)

```bash
npm run seed
```

Output:
```
✅ Inserted 10 seeds
✅ Inserted 10 locations
```

### 4. Start Server

```bash
npm run start:dev
```

---

## 🎯 ทดสอบ API

### เปิด Swagger UI (แนะนำ!)

```
http://localhost:3000/api/docs
```

**Swagger มี:**
- ✅ ทดสอบ endpoints ทั้งหมด
- ✅ ดู request/response examples
- ✅ Try it out โดยตรง
- ✅ Schema definitions

---

## 🧪 ทดสอบด้วย cURL

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

### 2. Get All Seeds

```bash
curl http://localhost:3000/api/seeds
```

### 3. Get All Locations

```bash
curl http://localhost:3000/api/locations
```

### 4. Test Google Login (Browser)

```
http://localhost:3000/api/auth/google
```

### 5. Plant a Tree

```bash
curl -X POST http://localhost:3000/api/game/plant \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "seedId": "SEED_ID_FROM_SEEDS_ENDPOINT",
    "slotIndex": 0
  }'
```

### 6. Water Tree

```bash
curl -X POST http://localhost:3000/api/game/click \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "plantedTreeId": "PLANTED_TREE_ID",
    "timeReduction": 1
  }'
```

### 7. Sell Tree

```bash
curl -X POST http://localhost:3000/api/game/sell \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "plantedTreeId": "PLANTED_TREE_ID"
  }'
```

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `COMPLETE_API.md` | Complete API reference |
| `AUTH_API.md` | Google OAuth + JWT guide |
| `USER_API.md` | User endpoints |
| `SEED_DATA.md` | Seeds & locations data |
| `README.md` | Project overview |

---

## 🎮 Complete Game Flow

```bash
# 1. Login with Google
http://localhost:3000/api/auth/google
# → Get JWT token

# 2. Get User ID from token
# → Use USER_ID for following requests

# 3. Get available seeds
curl http://localhost:3000/api/seeds

# 4. Plant a tree
curl -X POST http://localhost:3000/api/game/plant \
  -d '{"userId":"YOUR_ID","seedId":"SEED_ID","slotIndex":0}'

# 5. Water tree 5 times
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/game/click \
    -d '{"userId":"YOUR_ID","plantedTreeId":"TREE_ID","timeReduction":1}'
done

# 6. Wait for tree to be ready (or keep watering)

# 7. Sell tree
curl -X POST http://localhost:3000/api/game/sell \
  -d '{"userId":"YOUR_ID","plantedTreeId":"TREE_ID"}'

# 8. Check game state
curl http://localhost:3000/api/users/YOUR_ID/state
```

---

## 🌐 API Endpoints Summary

### Authentication
```
GET    /api/auth/google              - Start login
GET    /api/auth/google/callback     - OAuth callback
GET    /api/auth/profile             - Get profile (JWT)
GET    /api/auth/status              - Auth status
```

### Users
```
POST   /api/users                    - Create user
GET    /api/users/:userId            - Get user
PATCH  /api/users/:userId            - Update user
GET    /api/users/:userId/state      - Game state
```

### Seeds
```
GET    /api/seeds                    - All seeds
GET    /api/seeds/available          - Available seeds
GET    /api/seeds/:seedId            - Seed details
```

### Locations
```
GET    /api/locations                - All locations
GET    /api/locations/available      - Affordable locations
GET    /api/locations/:locationId    - Location details
```

### Game
```
POST   /api/game/plant               - Plant tree
POST   /api/game/click               - Water tree
POST   /api/game/sell                - Sell tree
```

---

## 🔥 ข้อมูลที่มีอยู่แล้ว

### 10 Seeds Seeded
1. Tree A (Free, 5min)
2. Tree B (500g, 10min)
3. Tree C (2,000g, 20min)
4. Palm Tree (8,000g, 40min)
5. Cherry Blossom (30,000g, 1h)
6. Christmas Tree (100,000g, 2h)
7. Maple Tree (350,000g, 4h)
8. Willow Tree (1M, 6h)
9. Sakura Tree (3M, 12h)
10. World Tree (10M, 24h)

### 10 Locations Seeded
1. Dirt Patch (Free, 1.0x)
2. Garden Bed (5,000g, 1.1x)
3. Greenhouse (50,000g, 1.15x)
4. Hydroponic Farm (200,000g, 1.2x)
5. Magic Garden (800,000g, 1.25x)
6. Crystal Garden (2M, 1.3x)
7. Sky Farm (5M, 1.35x)
8. Moon Garden (15M, 1.4x)
9. Star Grove (40M, 1.5x)
10. Divine Realm (100M, 2.0x)

---

## 💡 Tips

### ใช้ Swagger UI
- **ง่ายที่สุด**: ไปที่ http://localhost:3000/api/docs
- ทดสอบ endpoints ได้เลย
- เห็น request/response ตัวอย่าง

### Get User ID
หลัง login ด้วย Google:
```javascript
// Decode JWT token
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload.sub); // USER_ID
```

### Get Seed/Location IDs
```bash
# Get all seeds
curl http://localhost:3000/api/seeds | jq '.data[0]._id'

# Get all locations
curl http://localhost:3000/api/locations | jq '.data[0]._id'
```

---

## 🚨 Troubleshooting

### Server ไม่ start
```bash
# ลบ node_modules แล้วติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection error
- ตรวจสอบ internet connection
- MongoDB Atlas ต้อง whitelist IP address

### Seed ไม่ได้
```bash
# Run seed script อีกครั้ง
npm run seed
```

### Google OAuth error
- ตรวจสอบ Client ID / Secret ใน .env
- ตรวจสอบ redirect URI ใน Google Console

---

## 📱 Ready for Frontend!

Backend พร้อมแล้วสำหรับ:
- ✅ React Native mobile app
- ✅ React web app
- ✅ Any frontend framework

**API Base URL:**
```
http://localhost:3000/api
```

---

## 🎉 สรุป

```bash
# เริ่มต้นใช้งาน 3 ขั้นตอน:

1. npm install
2. npm run seed
3. npm run start:dev

# เปิด Swagger:
http://localhost:3000/api/docs

# ทดสอบเลย!
```

**Backend สมบูรณ์และพร้อมใช้งาน 100%!** 🚀
