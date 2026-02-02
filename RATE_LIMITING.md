# Rate Limiting - API Protection

## 🛡️ Overview:

Rate limiting ป้องกัน API abuse, spam, และ DDoS attacks

**Installed:** `@nestjs/throttler`

---

## 📊 Current Configuration:

### Global Limits (3 tiers):

```typescript
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000,      // 1 second
    limit: 10,      // 10 requests per second
  },
  {
    name: 'medium',
    ttl: 60000,     // 1 minute  
    limit: 100,     // 100 requests per minute
  },
  {
    name: 'long',
    ttl: 3600000,   // 1 hour
    limit: 1000,    // 1000 requests per hour
  },
])
```

**Applied to ALL endpoints automatically**

---

## 🚨 Error Response:

### When Limit Exceeded:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

**HTTP Status:** `429 Too Many Requests`

---

## 🎯 Custom Limits per Endpoint:

### Skip Rate Limiting:
```typescript
import { SkipThrottle } from '@nestjs/throttler';

@Controller('public')
export class PublicController {
  @SkipThrottle()  // Skip rate limiting
  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }
}
```

### Custom Limit:
```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('game')
export class GameController {
  @Throttle({ short: { limit: 3, ttl: 1000 } })  // 3 per second
  @Post('click')
  async clickTree() {
    // ...
  }
}
```

---

## 📋 Recommended Limits:

### Authentication:
```typescript
@Throttle({ short: { limit: 5, ttl: 60000 } })  // 5 per minute
@Post('login')
```
**Reason:** Prevent brute force attacks

### Game Actions:
```typescript
@Throttle({ short: { limit: 10, ttl: 1000 } })  // 10 per second
@Post('click')
```
**Reason:** Prevent spam clicks

### Data Queries:
```typescript
// Use default (100 per minute)
@Get('seeds')
```
**Reason:** Normal usage

### File Uploads:
```typescript
@Throttle({ short: { limit: 3, ttl: 60000 } })  // 3 per minute
@Post('upload')
```
**Reason:** Prevent spam uploads

---

## 🧪 Testing:

### Test Rate Limit:
```bash
# Spam requests
for i in {1..15}; do
  curl http://localhost:3000/api/seeds &
done

# After 10 requests, you'll get 429
```

### Swagger Test:
1. เปิด Swagger: http://localhost:3000/api/docs
2. กด "Try it out" endpoint เดียวกันหลายครั้ง
3. Request ที่ 11 จะได้ 429 error

---

## 💻 Frontend Handling:

### Detect Rate Limit:
```typescript
async function apiCall() {
  try {
    const response = await fetch(url);
    
    if (response.status === 429) {
      // Rate limited!
      const retryAfter = response.headers.get('Retry-After');
      
      showError(`Too many requests. Try again in ${retryAfter}s`);
      
      // Wait and retry
      setTimeout(() => apiCall(), retryAfter * 1000);
    }
    
    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
  }
}
```

### With Retry Logic:
```typescript
async function apiCallWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
        await sleep(retryAfter * 1000);
        continue;  // Retry
      }
      
      return response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * (i + 1));  // Exponential backoff
    }
  }
}
```

---

## 🔧 Advanced Configuration:

### Per-User Rate Limiting:
```typescript
// custom-throttler.guard.ts
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    // Rate limit per user instead of IP
    return req.user?.id || req.ip;
  }
}
```

### IP Whitelist:
```typescript
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    
    // Skip rate limit for trusted IPs
    const whitelist = ['127.0.0.1', '::1'];
    return whitelist.includes(ip);
  }
}
```

---

## 📊 Monitoring:

### Log Rate Limit Hits:
```typescript
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest();
    
    console.log(`Rate limit exceeded:`, {
      ip: request.ip,
      path: request.path,
      user: request.user?.id,
    });
    
    super.throwThrottlingException(context);
  }
}
```

---

## 🎯 Best Practices:

### 1. Set Appropriate Limits:
- Too strict → frustrate users
- Too loose → no protection
- Test with real usage patterns

### 2. Inform Users:
```json
{
  "error": "Rate limit exceeded",
  "message": "You can make 100 requests per minute",
  "retryAfter": 45
}
```

### 3. Different Limits for Different Actions:
- Read operations: Higher limit
- Write operations: Lower limit
- Auth operations: Strictest limit

### 4. Monitor and Adjust:
- Track 429 errors
- Adjust limits based on usage
- Add alerts for abuse

---

## 🚀 Production Tips:

### Redis Storage (Optional):
```typescript
// For distributed systems
ThrottlerModule.forRoot({
  storage: new ThrottlerStorageRedisService(redis),
  // ...
})
```
**Benefit:** Share rate limit state across multiple servers

### CDN/Proxy:
- Cloudflare: Built-in rate limiting
- AWS WAF: Custom rules
- NGINX: Rate limiting module

---

## ✅ Current Setup:

**Global Limits:**
- 10 requests per second ✅
- 100 requests per minute ✅
- 1000 requests per hour ✅

**Applied to:**
- All API endpoints
- Automatic 429 responses
- Header: `Retry-After`

**Protection against:**
- DDoS attacks
- API abuse
- Spam bots
- Brute force

---

## 📝 Summary:

**Installed:** ✅ @nestjs/throttler
**Configured:** ✅ 3-tier rate limiting
**Applied:** ✅ Global guard
**Protected:** ✅ All endpoints

**Next Steps (Optional):**
- Customize per-endpoint limits
- Add Redis for distributed systems
- Monitor 429 errors
- Adjust limits based on usage

**Your API is now protected!** 🛡️
