# Smart Seed System - Intelligent Database Sync

## 🎯 การเปลี่ยนแปลง:

### ❌ Before (Drop All):
```
1. ลบ seeds ทั้งหมด
2. ลบ locations ทั้งหมด
3. Insert ใหม่ทั้งหมด
```

**ปัญหา:**
- 🔴 ข้อมูล users ที่อ้างอิง (foreign key) หาย
- 🔴 ต้อง restart เกมทุกครั้ง
- 🔴 ไม่สามารถ update ข้อมูลได้

### ✅ After (Smart Sync):
```
1. เช็คแต่ละ item ใน seed data:
   - ถ้ามีใน DB → Update
   - ถ้าไม่มี → Insert
2. ลบ items ที่ไม่มีใน seed data
```

**ประโยชน์:**
- ✅ ข้อมูล users ไม่หาย (foreign key ยังใช้ได้)
- ✅ Update ข้อมูลได้โดยไม่ต้อง restart
- ✅ ลบ items เก่าที่ไม่ใช้แล้วอัตโนมัติ

---

## 🔧 การทำงาน:

### Sync Algorithm:

```typescript
async function syncCollection(collectionName, dataArray, uniqueField = 'code') {
  // 1. Upsert (Insert or Update)
  for (const item of dataArray) {
    await collection.updateOne(
      { code: item.code },      // Find by code
      { $set: item },           // Update all fields
      { upsert: true }          // Insert if not exist
    );
  }

  // 2. Delete items not in seed data
  const seedCodes = dataArray.map(item => item.code);
  await collection.deleteMany({
    code: { $nin: seedCodes }   // Not in seed codes
  });
}
```

### Unique Field:
- Seeds: `code` (bean_sprout, radish, etc.)
- Locations: `code` (waste_land, front_yard, etc.)

---

## 📊 Output Example:

### First Run (Empty DB):
```bash
$ npm run seed

🔌 Connecting to MongoDB...
✅ Connected to MongoDB

🌱 Syncing seeds...
   ✅ 5 inserted
   🔄 0 updated
   🗑️  0 deleted

📍 Syncing locations...
   ✅ 4 inserted
   🔄 0 updated
   🗑️  0 deleted

📊 Seed Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Seeds:
  • Inserted: 5
  • Updated:  0
  • Deleted:  0
Locations:
  • Inserted: 4
  • Updated:  0
  • Deleted:  0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Seed completed successfully!
🌳 Your Idle Garden database is synced.
```

### Second Run (Update Data):
```bash
$ npm run seed

🔌 Connecting to MongoDB...
✅ Connected to MongoDB

🌱 Syncing seeds...
   ✅ 0 inserted
   🔄 5 updated      ← Updated existing
   🗑️  0 deleted

📍 Syncing locations...
   ✅ 0 inserted
   🔄 4 updated      ← Updated existing
   🗑️  0 deleted

✅ Seed completed successfully!
```

### Adding New Item:
```bash
# เพิ่ม tomato ใน seeds.data.ts

$ npm run seed

🌱 Syncing seeds...
   ✅ 1 inserted      ← New item!
   🔄 5 updated
   🗑️  0 deleted
```

### Removing Old Item:
```bash
# ลบ bean_sprout จาก seeds.data.ts

$ npm run seed

🌱 Syncing seeds...
   ✅ 0 inserted
   🔄 4 updated
   🗑️  1 deleted      ← Removed!
```

---

## 🎮 Use Cases:

### 1. เพิ่ม Seed ใหม่:
```typescript
// src/database/data/seeds.data.ts
export const seedsData = [
  // ... existing seeds ...
  {
    code: 'tomato',      // ⭐ เพิ่มใหม่
    name: 'Tomato',
    basePrice: 2500,
    baseSellPrice: 4500,
    baseGrowTime: 1500,
    // ...
  },
];
```

```bash
$ npm run seed
# → ✅ 1 inserted (tomato)
```

### 2. Update ราคา:
```typescript
{
  code: 'carrot',
  name: 'Carrot',
  basePrice: 2000,        // เปลี่ยนจาก 1500
  baseSellPrice: 3500,    // เปลี่ยนจาก 2700
  // ...
}
```

```bash
$ npm run seed
# → 🔄 1 updated (carrot price changed)
```

### 3. ลบ Seed เก่า:
```typescript
// ลบ bean_sprout ออกจาก array
export const seedsData = [
  // bean_sprout ถูกลบ
  { code: 'radish', ... },
  { code: 'lettuce', ... },
  // ...
];
```

```bash
$ npm run seed
# → 🗑️  1 deleted (bean_sprout)
```

---

## 🛡️ Safety:

### Foreign Key Protection:
```typescript
// Users ที่มี unlockedSeeds หรือ currentLocation
// จะไม่เกิดปัญหาเพราะ:
// 1. Update → ObjectId ยังเหมือนเดิม ✅
// 2. Delete → ต้องระวัง! ⚠️
```

### Recommendation:
```typescript
// ก่อนลบ seed/location ควร:
1. เช็คว่ามี user ใช้งานหรือไม่
2. ถ้ามี → ย้าย user ไปใช้ item อื่น
3. หรือ → ทำให้ item นั้น "deprecated" แทนลบ

// Example: Soft delete
{
  code: 'old_seed',
  deprecated: true,        // ไม่แสดงในร้าน
  available: false,        // ไม่ให้ปลูกได้
  // แต่ยังอยู่ใน DB สำหรับ user เก่า
}
```

---

## 🧪 Testing:

### Test 1: First Seed
```bash
# Empty database
npm run seed

# Expected:
# Seeds: 5 inserted, 0 updated, 0 deleted
# Locations: 4 inserted, 0 updated, 0 deleted
```

### Test 2: Re-run (No Changes)
```bash
# Run again without changing data
npm run seed

# Expected:
# Seeds: 0 inserted, 5 updated, 0 deleted
# Locations: 0 inserted, 4 updated, 0 deleted
```

### Test 3: Add New Seed
```typescript
// Add strawberry to seeds.data.ts
npm run seed

# Expected:
# Seeds: 1 inserted, 5 updated, 0 deleted
```

### Test 4: Update Price
```typescript
// Change carrot price
npm run seed

# Expected:
# Seeds: 0 inserted, 5 updated, 0 deleted
# (carrot price will be updated)
```

### Test 5: Delete Seed
```typescript
// Remove radish from seeds.data.ts
npm run seed

# Expected:
# Seeds: 0 inserted, 4 updated, 1 deleted
```

---

## 📝 Comparison:

| Feature | Old (Drop All) | New (Smart Sync) |
|---------|----------------|------------------|
| **User Data** | Lost ❌ | Safe ✅ |
| **Update Data** | Not possible ❌ | Easy ✅ |
| **Add New** | Restart needed ❌ | Automatic ✅ |
| **Remove Old** | Manual ❌ | Automatic ✅ |
| **Speed** | Fast | Fast |
| **Safety** | Low | High ✅ |

---

## ⚠️ Important Notes:

### When to Use:

**✅ Safe:**
- Update prices
- Update grow times
- Update descriptions
- Add new seeds/locations
- Update bonuses

**⚠️ Careful:**
- Delete seeds/locations (check users first!)
- Change `code` field (will create new item)

### Best Practices:

```typescript
// ✅ Good: Update data
{
  code: 'carrot',  // Same code
  basePrice: 2000, // New price
}

// ❌ Bad: Change code
{
  code: 'carrot_v2',  // Different code = new item!
  basePrice: 2000,
}

// ✅ Good: Add new
{
  code: 'tomato',  // New seed
  // ...
}

// ⚠️ Careful: Delete
// Remove from array = delete from DB
// Make sure no users reference it!
```

---

## 🎯 Summary:

**Features:**
- ✅ Upsert (insert or update)
- ✅ Auto delete orphaned items
- ✅ Safe for existing users
- ✅ Easy to maintain
- ✅ Clear console output

**Usage:**
```bash
npm run seed
```

**Result:**
- Insert new items
- Update existing items
- Delete removed items
- Preserve user references

**Your database stays in sync with code!** 🎉
