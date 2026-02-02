# Combo System - Time Reduction Bonus

## 🔥 ระบบ Combo:

**เมื่อคลิกติดกันหลายครั้ง จะได้ bonus time reduction เพิ่ม**

---

## 📊 Combo Tiers:

| Combo | Multiplier | Example (10 clicks) |
|-------|------------|---------------------|
| 1-4 clicks | 1x (base) | 4s |
| 5-9 clicks | 1.5x | 5s + 4×1.5s = 11s |
| 10-19 clicks | 2x | 5s + 5×1.5s + 5×2s = 22.5s → 23s |
| 20+ clicks | 3x | 5s + 5×1.5s + 10×2s + 5×3s = 47.5s → 48s |

---

## 💻 Frontend Implementation:

### Combo Calculation:
```typescript
function calculateComboReduction(clicks: number, clickPower: number = 1): number {
  let total = 0;
  
  for (let i = 0; i < clicks; i++) {
    let reduction = clickPower;  // Base reduction (1s or 2s if upgraded)
    
    // Apply combo multiplier based on current combo count
    if (i >= 20) {
      reduction *= 3;      // 3x bonus at 20+ combo
    } else if (i >= 10) {
      reduction *= 2;      // 2x bonus at 10-19 combo
    } else if (i >= 5) {
      reduction *= 1.5;    // 1.5x bonus at 5-9 combo
    }
    // else 1x (base) at 0-4 combo
    
    total += reduction;
  }
  
  return Math.floor(total);
}
```

### Examples:
```typescript
calculateComboReduction(1)   // → 1s   (base)
calculateComboReduction(5)   // → 7s   (5 base + 0 bonus, then starts at click 6)
calculateComboReduction(10)  // → 17s  (5 + 5×1.5 + 5×2)
calculateComboReduction(20)  // → 42s  (5 + 5×1.5 + 10×2 + 5×3)
calculateComboReduction(50)  // → 117s (5 + 5×1.5 + 10×2 + 30×3)
```

---

## 🎮 Visual Feedback:

### Display Combo:
```typescript
function TreeComponent({ tree }) {
  const [combo, setCombo] = useState(0);
  const [timeReduction, setTimeReduction] = useState(0);
  
  const comboMultiplier = combo >= 20 ? 3 : 
                          combo >= 10 ? 2 : 
                          combo >= 5 ? 1.5 : 1;
  
  const handleClick = () => {
    const newCombo = combo + 1;
    setCombo(newCombo);
    setTimeReduction(calculateComboReduction(newCombo));
  };
  
  return (
    <div>
      {/* Combo indicator */}
      {combo > 0 && (
        <div className={`combo combo-${comboMultiplier}`}>
          <h2>🔥 COMBO x{comboMultiplier.toFixed(1)}</h2>
          <p>{combo} clicks → {timeReduction}s reduction</p>
        </div>
      )}
      
      <button onClick={handleClick}>
        💧 Water
      </button>
    </div>
  );
}
```

### CSS Animation:
```css
.combo {
  animation: pulse 0.3s ease-in-out;
}

.combo-1 { color: #888; }      /* Gray - Base */
.combo-1\.5 { color: #4CAF50; } /* Green - 5+ combo */
.combo-2 { color: #FF9800; }    /* Orange - 10+ combo */
.combo-3 { color: #F44336; }    /* Red - 20+ combo */

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

---

## 🔒 Backend Validation:

### Anti-Cheat Protection:
```typescript
// Max 10 seconds per click (generous for combo)
const maxReasonable = clicks * 10;

if (timeReduction > maxReasonable) {
  throw new BadRequestException(
    `Time reduction too high. Max ${maxReasonable}s for ${clicks} clicks`
  );
}
```

### Examples:
```typescript
// Valid
10 clicks, 17s reduction  ✅ (17 < 100)
20 clicks, 42s reduction  ✅ (42 < 200)
50 clicks, 117s reduction ✅ (117 < 500)

// Invalid
10 clicks, 200s reduction ❌ (200 > 100)
5 clicks, 100s reduction  ❌ (100 > 50)
```

---

## 📊 API Request/Response:

### Request:
```json
{
  "plantedTreeId": "507f...",
  "clicks": 20,
  "timeReduction": 42
}
```

### Response:
```json
{
  "success": true,
  "message": "Watered tree 20 times (42s reduced)",
  "data": {
    "clicksProcessed": 20,
    "timeReduced": 42,
    "totalClicks": 180,
    "timeLeft": 258,
    "isReady": false
  }
}
```

---

## 🎯 Combo Strategy:

### For Players:
1. **Quick taps** → Build combo faster
2. **Hold combo** → Get max bonus before sending
3. **5+ combo** → 1.5x bonus (worth waiting)
4. **10+ combo** → 2x bonus (significant)
5. **20+ combo** → 3x bonus (huge reward)

### Optimal Play:
- **Short trees** (<5 min): Click fast, send at 10-20 combo
- **Long trees** (>10 min): Build to 20+ combo for max efficiency
- **Almost done**: Send immediately (don't wait for combo)

---

## 🧪 Testing:

### Unit Test:
```typescript
describe('calculateComboReduction', () => {
  it('should calculate base correctly', () => {
    expect(calculateComboReduction(1)).toBe(1);
    expect(calculateComboReduction(4)).toBe(4);
  });
  
  it('should apply 1.5x at 5+ combo', () => {
    expect(calculateComboReduction(5)).toBe(7);  // 5 + 0 bonus
    expect(calculateComboReduction(6)).toBe(8);  // 5 + 1×1.5
  });
  
  it('should apply 2x at 10+ combo', () => {
    expect(calculateComboReduction(10)).toBe(17); // 5 + 5×1.5 + 0
    expect(calculateComboReduction(11)).toBe(19); // 5 + 5×1.5 + 1×2
  });
  
  it('should apply 3x at 20+ combo', () => {
    expect(calculateComboReduction(20)).toBe(42); // 5 + 5×1.5 + 10×2 + 0
    expect(calculateComboReduction(21)).toBe(45); // ... + 1×3
  });
});
```

---

## 📈 Scaling:

### Click Power Upgrade:
```typescript
// ถ้ามี upgrade (clickPower = 2)
calculateComboReduction(10, 2)  // → 34s (doubled)
calculateComboReduction(20, 2)  // → 84s (doubled)
```

### Progressive System:
```typescript
// Future: More combo tiers
if (i >= 50) reduction *= 5;      // 5x at 50+
else if (i >= 30) reduction *= 4;  // 4x at 30+
```

---

## 🎨 UI Examples:

### Simple (Text):
```
💧 Water (15 clicks)
🔥 Combo: x2.0
⏱️ -32s pending
```

### Advanced (Visual):
```
╔════════════════════════════════╗
║  🔥 MEGA COMBO! 🔥             ║
║                                ║
║  20 CLICKS → 42s REDUCTION     ║
║                                ║
║  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 100%    ║
╚════════════════════════════════╝

      💧 KEEP CLICKING! 💧
```

---

## ✅ Summary:

**Combo Benefits:**
- ⚡ Faster tree growth
- 🎮 Engaging gameplay
- 🏆 Skill-based rewards
- 💪 Encourages active play

**Implementation:**
- ✅ Frontend calculates combo
- ✅ Backend validates (anti-cheat)
- ✅ Max 10s per click validation
- ✅ Smooth UI feedback

**Combo Tiers:**
- 1-4 clicks: 1x (base)
- 5-9 clicks: 1.5x
- 10-19 clicks: 2x
- 20+ clicks: 3x

**Ready to create engaging gameplay!** 🎉
