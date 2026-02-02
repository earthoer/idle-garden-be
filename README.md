# Idle Garden Backend

NestJS backend for idle garden mobile game.

---

## 📁 Project Structure

```
src/
├── auth/           # Google OAuth + JWT
├── users/          # User management  
├── game/           # Plant, water, sell
├── seeds/          # Seed master data
├── locations/      # Location master data
├── ads/            # Ad reward system
├── database/       # Seed scripts
└── schemas/        # MongoDB models
```

---

## 🚀 Quick Start

### 1. Install
```bash
npm install
```

### 2. Setup `.env`
```env
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3001
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
npm run start:dev
```

### 5. API Docs
```
http://localhost:3000/api/docs
```

---

## 📚 Documentation

See documentation files:
- `QUICK_START.md` - Setup guide
- `COMPLETE_API.md` - API reference
- `AUTH_API.md` - Authentication
- Other `.md` files for details

---

## 🎮 Features

- Google OAuth + JWT
- 5 Seeds, 4 Locations
- Combo click system
- Ad rewards (2/day)
- Rate limiting
- Swagger docs

---

**Ready to play!** 🌱
