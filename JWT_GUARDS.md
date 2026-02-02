# JWT Guards & Authentication

## 🔒 Protected Endpoints

Backend ใช้ JWT Guards เพื่อป้องกัน endpoints ที่ต้อง authentication และตรวจสอบ ownership

---

## 📋 Endpoint Security

### 🔓 Public Endpoints (ไม่ต้อง JWT)
```
GET    /api/auth/google              ✅ Start OAuth
GET    /api/auth/google/callback     ✅ OAuth callback
GET    /api/auth/status              ✅ Check auth status
POST   /api/users                    ✅ Create user (registration)
GET    /api/users/google/:googleId   ✅ Get user by Google ID (login)
GET    /api/seeds                    ✅ Get all seeds
GET    /api/seeds/available          ✅ Get available seeds
GET    /api/seeds/:seedId            ✅ Get seed details
GET    /api/locations                ✅ Get all locations
GET    /api/locations/available      ✅ Get available locations
GET    /api/locations/:locationId    ✅ Get location details
```

### 🔒 Protected Endpoints (ต้อง JWT + Ownership)
```
GET    /api/auth/profile             🔒 Get profile from token
GET    /api/users/:userId            🔒 Get user (must be owner)
PATCH  /api/users/:userId            🔒 Update user (must be owner)
GET    /api/users/:userId/state      🔒 Get game state (must be owner)
POST   /api/users/:userId/login      🔒 Update login (must be owner)
POST   /api/game/plant               🔒 Plant tree (must be owner)
POST   /api/game/click               🔒 Water tree (must be owner)
POST   /api/game/sell                🔒 Sell tree (must be owner)
```

---

## 🎯 How JWT Guards Work

### 1. Get JWT Token (Login)
```bash
# User logs in with Google OAuth
GET http://localhost:3000/api/auth/google

# After successful login, redirects with token:
http://localhost:3001/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Include Token in Requests
```bash
# Add Authorization header
curl http://localhost:3000/api/users/USER_ID/state \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Backend Validates Token
```typescript
// JwtAuthGuard automatically:
1. Extracts token from Authorization header
2. Validates JWT signature
3. Checks expiration
4. Injects user data into request.user
```

### 4. Ownership Validation
```typescript
// Controllers check ownership:
@CurrentUser() currentUser: any

if (currentUser.userId !== requestedUserId) {
  throw new ForbiddenException('You can only access your own data');
}
```

---

## 💻 Frontend Integration

### React/React Native Example

```typescript
// Store token after login
localStorage.setItem('access_token', token);

// Decode token to get userId
const payload = JSON.parse(atob(token.split('.')[1]));
const userId = payload.sub;
localStorage.setItem('user_id', userId);

// API client with authentication
const api = {
  baseUrl: 'http://localhost:3000/api',
  
  getHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  },
  
  async getGameState(userId) {
    const response = await fetch(`${this.baseUrl}/users/${userId}/state`, {
      headers: this.getHeaders(),
    });
    return response.json();
  },
  
  async plantTree(userId, seedId, slotIndex) {
    const response = await fetch(`${this.baseUrl}/game/plant`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId, seedId, slotIndex }),
    });
    return response.json();
  },
};
```

---

## 🧪 Testing with Swagger

### 1. เปิด Swagger UI
```
http://localhost:3000/api/docs
```

### 2. Authorize with JWT

**ขั้นตอน:**
1. คลิกปุ่ม **"Authorize"** (🔓 ด้านบนขวา)
2. ใส่ JWT token ในช่อง "Value"
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. คลิก **"Authorize"**
4. คลิก **"Close"**

**หลังจากนี้ทุก request จะมี Authorization header อัตโนมัติ!**

### 3. Test Protected Endpoints

**Try it out:**
- GET `/api/auth/profile` - ดูข้อมูล user จาก token
- GET `/api/users/{userId}/state` - ดูสถานะเกม
- POST `/api/game/plant` - ปลูกต้นไม้

---

## 🧪 Testing with cURL

### Get JWT Token
```bash
# 1. Login with Google (browser)
http://localhost:3000/api/auth/google

# 2. Get token from redirect URL
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Extract userId from token
USER_ID=$(echo $TOKEN | cut -d'.' -f2 | base64 -d | jq -r '.sub')
```

### Test Protected Endpoints
```bash
# Get profile
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# Get game state
curl http://localhost:3000/api/users/$USER_ID/state \
  -H "Authorization: Bearer $TOKEN"

# Plant tree
curl -X POST http://localhost:3000/api/game/plant \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seedId": "SEED_ID",
    "slotIndex": 0
  }'

# Water tree (batch clicks)
curl -X POST http://localhost:3000/api/game/click \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plantedTreeId": "TREE_ID",
    "clicks": 5
  }'
```

---

## 🚨 Error Responses

### 401 Unauthorized (Missing or Invalid Token)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causes:**
- No Authorization header
- Invalid JWT signature
- Expired token
- Malformed token

**Fix:**
- Include valid JWT token in Authorization header
- Login again if token expired

### 403 Forbidden (Not Owner)
```json
{
  "statusCode": 403,
  "message": "You can only access your own data"
}
```

**Causes:**
- Trying to access another user's data
- userId in request doesn't match JWT token's userId

**Fix:**
- Only access your own user data
- Use userId from your JWT token

---

## 🔑 JWT Token Structure

### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload
```json
{
  "sub": "697dd77a7460c044869d03f2",  // userId
  "email": "user@example.com",
  "googleId": "104055744437937272058",
  "iat": 1706697600,                  // issued at
  "exp": 1707302400                   // expires (7 days)
}
```

### Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET
)
```

---

## 🛡️ Security Features

### 1. JWT Validation
- ✅ Signature verification
- ✅ Expiration check (7 days)
- ✅ Algorithm validation (HS256)

### 2. Ownership Validation
- ✅ User can only access their own data
- ✅ userId in request must match token
- ✅ Prevents unauthorized access

### 3. HTTPS Recommended
- ⚠️ Use HTTPS in production
- ⚠️ Protect JWT_SECRET environment variable
- ⚠️ Don't commit secrets to git

---

## 📊 Complete Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│  User   │                │ Backend │                │ MongoDB │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ 1. Login with Google     │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │ 2. Return JWT token      │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │ 3. API call with JWT     │                          │
     ├─────────────────────────>│                          │
     │    (Authorization header)│                          │
     │                          │                          │
     │                          │ 4. Validate JWT          │
     │                          │    (JwtAuthGuard)        │
     │                          │                          │
     │                          │ 5. Check ownership       │
     │                          │    (Controller)          │
     │                          │                          │
     │                          │ 6. Query database        │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ 7. Return data           │
     │                          │<─────────────────────────┤
     │                          │                          │
     │ 8. Return response       │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
```

---

## 💡 Best Practices

### Frontend
1. **Store token securely**
   - localStorage for web (XSS risk - be careful)
   - Secure storage for mobile (Keychain/Keystore)

2. **Handle token expiration**
   - Check exp before each request
   - Redirect to login if expired
   - Implement refresh token (future)

3. **Include token in all protected requests**
   - Use interceptor/middleware
   - Add Authorization header automatically

### Backend
1. **Keep JWT_SECRET safe**
   - Never commit to git
   - Use environment variables
   - Rotate regularly in production

2. **Set appropriate expiration**
   - Current: 7 days
   - Balance security vs UX
   - Consider refresh tokens for long sessions

3. **Validate ownership**
   - Always check userId matches token
   - Don't trust userId in request body alone
   - Use @CurrentUser() decorator

---

## 🔄 Token Refresh (Future)

**Not implemented yet, but recommended for production:**

```typescript
// Refresh token flow
POST /api/auth/refresh
{
  "refreshToken": "..."
}

// Returns new access token
{
  "access_token": "...",
  "expires_in": 604800
}
```

---

## ✅ Summary

**Protected by JWT + Ownership:**
- ✅ User endpoints (GET, PATCH, state, login)
- ✅ Game endpoints (plant, click, sell)
- ✅ Profile endpoint

**Public (No JWT):**
- ✅ Auth endpoints (Google OAuth, status)
- ✅ Seeds/Locations (read-only data)
- ✅ User registration

**Security:**
- ✅ JWT signature validation
- ✅ Token expiration (7 days)
- ✅ Ownership validation
- ✅ Swagger integration

**Ready to test in Swagger!** 🚀
