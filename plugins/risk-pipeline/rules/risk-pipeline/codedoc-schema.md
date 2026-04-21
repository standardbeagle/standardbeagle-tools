---
name: codedoc-schema
description: "@risk annotation schema for code — 5-axis ASCII glyph system for risk-classified code units"
version: 1
---

## 總覽 (Overview)

碼文批註 `@risk` 標風險五軸。標籤棲於單元文檔，供預算聚合、分派評審、升級模型。ASCII唯一、無emoji；緊湊可掃、token省。讀者：風險管道技藝、人工審查者、LCI索引。

## 軸 (Axes)

五軸定序：`b` → `d` → `s` → `r` → `u`。位順固定，勿亂。

| Glyph | Axis | 義 |
|-------|------|---|
| `b` | blast | 破時影響之消費者與調用點 |
| `d` | data | 持久或外部數據之險（遷移、模式、序列化） |
| `s` | security | 鑒權、加密、授權、輸入驗、秘密 |
| `r` | reversibility | 難復原（已發產物、破壞操作） |
| `u` | unknowns | 新模式、無測試覆蓋、陌生API |

## 級 (Levels)

四級以ASCII字符表，對應數值。

| Glyph | Level | Numeric |
|-------|-------|---------|
| `.` | 低 low | 0 |
| `-` | 中 med | 1 |
| `+` | 高 high | 2 |
| `!` | 危 crit | 3 |

## 欄位 (Fields)

- `@risk b<L>d<L>s<L>r<L>u<L>` — 主行，位順固定，必備。
- `tagged:YYYY-MM-DD` — 必備，供質滯審計與備路檢查。
- `model:haiku|sonnet` — 必備，記升級優先。
- `conf:N.NN` — 必備，標籤器自報信心，範圍 0.0–1.0。
- `@risk-why "..."` — 任一軸=`!`時必備，餘則可選；≤140字符。

## 範圍 (Granularity)

標：函數、方法、類、導出常量。
跳：私閉包、匿名箭函數、類型別名。
模塊風險 = `max()` 跨導出符號之各軸。

## 質滯 (Staleness Detection)

主路：`PostToolUse` 鉤於每次編輯異步刷新所觸單元。
備路：`tagged:` 日期對 `git log -1 --format=%at` 行範圍之mtime；git新於tagged則滯。LCI暴此查詢。

## 語言映射 (Language Mapping)

六語言映射如下。主行語法因語言而異，欄位名不變。

| Language | Syntax |
|----------|--------|
| TS / JS  | JSDoc `/** */` |
| Python   | docstring, `@risk:` section |
| Go       | comment block above decl (Go doc convention) |
| Rust     | `///` doc comment |
| C# / F#  | XML `<risk>` element |
| Ruby     | YARD `@risk` tag |

## 範例 (Example)

TypeScript，含 `!` 級安全軸，故 `@risk-why` 必備：

```typescript
/**
 * Verify JWT signature, return decoded claims.
 *
 * @risk b+d.s!r-u. tagged:2026-04-21 model:haiku conf:0.91
 * @risk-why "Signature bypass = auth bypass. Broad blast via callers."
 */
function verifyJWT(token: string): Claims { ... }
```

解讀：blast 高、data 低、security 危、reversibility 中、unknowns 低。標籤日2026-04-21，由 haiku 產，信心 0.91。

## Emoji 變體 (Emoji Variant)

默認ASCII；emoji變體需顯式開啟 `risk_pipeline.emoji_glyphs: true`。代價：2–3倍 token，換人眼可辨之增。生產管道保持ASCII為宜。
