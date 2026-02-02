# Idle Garden Backend

Backend API สำหรับเกม Idle Garden ด้วย NestJS + MongoDB

## 📦 Tech Stack

- **Framework:** NestJS
- **Database:** MongoDB + Mongoose
- **Language:** TypeScript
- **Validation:** class-validator, class-transformer

## 🗄️ Database Schema

### Collections

1. **Users** - ข้อมูลผู้เล่น, progress, premium features
2. **PlantedTrees** - ต้นไม้ที่กำลังปลูกในแต่ละ slot
3. **Seeds** - ข้อมูล static ของเมล็ดพันธุ์ทั้งหมด
4. **Locations** - ข้อมูล static ของสถานที่ทั้งหมด

## 🚀 Setup

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. Setup MongoDB

ตั้งค่า MongoDB URI ใน `.env`:

```env
MONGODB_URI=mongodb+srv://earth_tree:i32MqJYg8JmYMrp0@idle-garden.ye7kzex.mongodb.net/idle-garden?appName=idle-garden
PORT=3000
NODE_ENV=development
```

### 3. Setup Google OAuth

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง OAuth 2.0 credentials
3. ตั้งค่า Authorized redirect URI:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
4. คัดลอก Client ID และ Client Secret ใส่ใน `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=7d

FRONTEND_URL=http://localhost:3001
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run Seed Script

Seed ข้อมูล Seeds (10 ต้นไม้) และ Locations (10 สถานที่):

```bash
npm run seed
```

คุณจะเห็น:
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

🗑️  Clearing existing data...
✅ Cleared seeds and locations collections

🌱 Inserting seeds...
✅ Inserted 10 seeds

📍 Inserting locations...
✅ Inserted 10 locations

📊 Seed Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Seeds:     10 inserted
Locations: 10 inserted
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Seed completed successfully!
🌳 Your Idle Garden database is ready to use.
```

### 5. Start Development Server

```bash
npm run start:dev
```

API จะรันที่: `http://localhost:3000/api`

### 6. Test Google Login (Browser)

เปิด browser ไปที่:
```
http://localhost:3000/api/auth/google
```

## 📁 Project Structure

```
src/
├── schemas/           # Mongoose schemas
│   ├── user.schema.ts
│   ├── planted-tree.schema.ts
│   ├── seed.schema.ts
│   └── location.schema.ts
├── app.module.ts      # Root module
├── app.controller.ts
├── app.service.ts
└── main.ts           # Bootstrap
```

## 🎯 Next Steps

- [ ] สร้าง Seed Script (seeds & locations data)
- [ ] สร้าง Game Module (controllers & services)
- [ ] สร้าง User Module
- [ ] Implement Google OAuth
- [ ] สร้าง API Endpoints

## 📝 API Endpoints

### Health Check
```
GET    /api              - API info
GET    /api/health       - Health check
```

### Authentication (Google OAuth + JWT)
```
GET    /api/auth/google              - เริ่ม Google OAuth flow
GET    /api/auth/google/callback     - Google OAuth callback
GET    /api/auth/profile             - ดึงข้อมูล user (protected)
GET    /api/auth/status              - Auth service status
```

### Users
```
POST   /api/users                 - สร้าง user ใหม่
GET    /api/users/:userId         - ดึงข้อมูล user
GET    /api/users/google/:googleId - ดึงข้อมูล user ด้วย Google ID
PATCH  /api/users/:userId         - อัพเดทข้อมูล user
GET    /api/users/:userId/state   - ดึงสถานะเกมทั้งหมด
POST   /api/users/:userId/login   - อัพเดท last login
```

### Game (Coming Soon)
```
POST   /api/game/plant   - ปลูกต้นไม้
POST   /api/game/click   - กดรดน้ำ
POST   /api/game/sell    - ขายต้นไม้
```

### Seeds & Locations (Coming Soon)
```
GET    /api/seeds        - รายการเมล็ด
GET    /api/locations    - รายการสถานที่
```

📖 **Documentation:**
- [AUTH_API.md](./AUTH_API.md) - Google OAuth & JWT Authentication
- [USER_API.md](./USER_API.md) - User Management

## ✅ Status

- ✅ NestJS Project Setup
- ✅ MongoDB Connection (Atlas)
- ✅ Mongoose Schemas (4 collections)
- ✅ Seed Script (10 seeds + 10 locations)
- ✅ Google OAuth + JWT Authentication
- ✅ User Module (6 endpoints)
- ✅ Seeds Module (3 endpoints)
- ✅ Locations Module (3 endpoints)
- ✅ Game Module (plant, click, sell)
- ✅ Swagger Documentation (/api/docs)

**🎉 Backend Complete!**
