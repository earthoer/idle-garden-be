# Auth API Documentation

## Base URL
```
http://localhost:3000/api/auth
```

---

## Setup Google OAuth

### 1. สร้าง Google OAuth Credentials

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่ หรือเลือก Project ที่มีอยู่
3. ไปที่ **APIs & Services** > **Credentials**
4. คลิก **Create Credentials** > **OAuth client ID**
5. เลือก **Application type**: Web application
6. ตั้งค่า:
   - **Name**: Idle Garden Backend
   - **Authorized redirect URIs**: 
     ```
     http://localhost:3000/api/auth/google/callback
     ```
7. คัดลอก **Client ID** และ **Client Secret**

### 2. อัพเดท .env

```env
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

JWT_SECRET=your_random_secret_key_here
JWT_EXPIRATION=7d

FRONTEND_URL=http://localhost:3001
```

---

## Endpoints

### 1. Start Google OAuth Flow
**GET** `/api/auth/google`

เริ่มต้น OAuth flow โดย redirect ไป Google login page

**Usage (Browser):**
```
http://localhost:3000/api/auth/google
```

**Flow:**
1. User คลิก "Login with Google" ใน Frontend
2. Frontend redirect ไป `http://localhost:3000/api/auth/google`
3. Backend redirect ไป Google OAuth consent screen
4. User login และ authorize app

---

### 2. Google OAuth Callback
**GET** `/api/auth/google/callback`

Google จะ callback มาที่นี่หลังจาก user authorize

**Auto Flow:**
1. Google redirect กลับมาพร้อม authorization code
2. Backend แลก code เป็น user profile
3. Backend สร้าง/อัพเดท user ใน database
4. Backend generate JWT token
5. Backend redirect ไป Frontend พร้อม token

**Redirect URL:**
```
http://localhost:3001/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. Get Profile (Protected)
**GET** `/api/auth/profile`

ดึงข้อมูล user จาก JWT token

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "googleId": "google_123456"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### 4. Auth Status
**GET** `/api/auth/status`

ตรวจสอบว่า Auth service ทำงานปกติ

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Auth service is running",
  "googleOAuthConfigured": true
}
```

---

## Frontend Integration

### React Example

```typescript
// Login Button Component
function LoginButton() {
  const handleLogin = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  return (
    <button onClick={handleLogin}>
      Login with Google
    </button>
  );
}
```

```typescript
// Callback Handler Page (/auth/callback)
function AuthCallback() {
  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Save token to localStorage
      localStorage.setItem('access_token', token);
      
      // Redirect to home
      window.location.href = '/';
    }
  }, []);

  return <div>Logging in...</div>;
}
```

```typescript
// API Client with Auth
async function fetchUserState() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:3000/api/users/USER_ID/state', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
}
```

---

## JWT Token Structure

**Payload:**
```json
{
  "sub": "507f1f77bcf86cd799439011",  // user._id
  "email": "user@example.com",
  "googleId": "google_123456",
  "iat": 1643723400,                   // issued at
  "exp": 1644328200                    // expires at (7 days)
}
```

**Expiration:** 7 days (configurable via `JWT_EXPIRATION`)

---

## Protected Routes

ใช้ `JwtAuthGuard` เพื่อป้องกัน endpoints:

```typescript
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Get('protected')
@UseGuards(JwtAuthGuard)
async protectedRoute(@Req() req: Request) {
  // req.user มีข้อมูล { userId, email, googleId }
  return {
    message: 'This is protected',
    user: req.user,
  };
}
```

---

## Testing

### 1. Test OAuth Flow (Browser)

1. เปิด browser ไปที่:
   ```
   http://localhost:3000/api/auth/google
   ```

2. Login ด้วย Google account

3. ดูว่า redirect ไป frontend พร้อม token หรือไม่

### 2. Test Protected Endpoint (cURL)

```bash
# Get token first from OAuth flow, then:
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Security Best Practices

1. **JWT Secret**: ใช้ random string ที่ยาว (≥32 characters)
   ```bash
   # Generate random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **HTTPS in Production**: ใช้ HTTPS สำหรับ OAuth callback

3. **Token Expiration**: ตั้งค่า expiration ตามความเหมาะสม (7d = good for mobile game)

4. **Refresh Tokens**: พิจารณาเพิ่ม refresh token mechanism ในอนาคต

5. **Rate Limiting**: เพิ่ม rate limiting สำหรับ auth endpoints

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
- ตรวจสอบว่า callback URL ใน Google Console ตรงกับ `.env`
- URL ต้องตรงทุกตัวอักษร (including http/https, port)

### Error: "Unauthorized"
- ตรวจสอบว่า JWT token ถูกส่งใน `Authorization` header
- ตรวจสอบว่า token ยังไม่หมดอายุ
- ตรวจสอบว่า `JWT_SECRET` ตรงกัน

### Error: "User not found"
- User อาจถูกลบออกจาก database
- ลอง login ใหม่

---

## Flow Diagram

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Frontend│                │ Backend │                │ Google  │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │  1. Click "Login"        │                          │
     ├─────────────────────────>│                          │
     │  GET /auth/google        │                          │
     │                          │                          │
     │  2. Redirect to Google   │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │  3. Login & Authorize    │                          │
     ├──────────────────────────┼─────────────────────────>│
     │                          │                          │
     │  4. Callback with code   │                          │
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │  5. Exchange code        │
     │                          │     Get user profile     │
     │                          │     Create/Update user   │
     │                          │     Generate JWT         │
     │                          │                          │
     │  6. Redirect with token  │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │  7. Store token          │                          │
     │     Redirect to home     │                          │
     │                          │                          │
     │  8. API calls with JWT   │                          │
     ├─────────────────────────>│                          │
     │  Authorization: Bearer.. │                          │
     │                          │                          │
```
