---
name: color-palette
description: Interactive color palette creation wizard with inspiration from Adobe Color, Coolors, and color theory principles. 互動調色板創建引導：Adobe Color、Coolors及色彩理論原則驅動，含無障礙驗證。 Use when: creating a brand color palette, generating tonal scales, validating color contrast, extending a palette for dark mode.
---

# Color Palette Creation

> Invoke the `Skill` tool with `skill: ux-design:color-theory` — 色彩理論與調色板設計原則為本命令基礎。

汝正引導用戶創建有目的、調和的調色板。

## Discovery Phase

詢問以下問題理解情境：

### 1. Brand & Emotional Direction
"What emotional qualities should this palette convey? For example:
- Trust and stability (blues, greens)
- Energy and excitement (reds, oranges)
- Calm and wellness (greens, soft blues)
- Luxury and sophistication (deep purples, golds, blacks)
- Playful and friendly (bright, saturated colors)
- Professional and neutral (grays, muted tones)"

### 2. Industry Context
"What industry or domain is this for? Different sectors have color conventions:
- Healthcare (blues, greens, white)
- Finance (blues, greens, grays)
- Food (reds, oranges, greens)
- Tech (blues, purples, gradients)
- Fashion (black, white, accent colors)
- Children's products (bright primaries)"

### 3. Existing Constraints
"Are there any colors you must include or avoid?
- Existing brand colors to preserve
- Competitor colors to differentiate from
- Cultural considerations for your audience"

### 4. Application Context
"Where will this palette be used?
- Digital only (web, app)
- Print materials
- Both digital and print
- Specific platform guidelines (iOS, Material)"

## Palette Generation

根據回答生成調色板選項：

### Provide 2-3 Palette Options

每個選項包含：

1. **Primary Color** - 主導品牌色
2. **Secondary Color** - 輔助色（互補或相似）
3. **Accent Color** - CTA和強調的高對比色
4. **Neutral Scale** - 帶微量色彩傾向的灰階
5. **Semantic Colors** - 成功、警告、錯誤、信息

### Format Each Palette Like This:

```
Option A: [Descriptive Name]
Emotional Quality: [Description of feeling]

Primary:    #XXXXXX | RGB: X, X, X | HSL: X°, X%, X%
Secondary:  #XXXXXX | RGB: X, X, X | HSL: X°, X%, X%
Accent:     #XXXXXX | RGB: X, X, X | HSL: X°, X%, X%

Neutral Scale:
  50:  #XXXXXX (backgrounds)
  100: #XXXXXX (subtle backgrounds)
  200: #XXXXXX (borders)
  300: #XXXXXX (disabled)
  400: #XXXXXX (placeholder text)
  500: #XXXXXX (secondary text)
  600: #XXXXXX (body text)
  700: #XXXXXX (headings)
  800: #XXXXXX (emphasis)
  900: #XXXXXX (maximum contrast)

Semantic:
  Success: #XXXXXX
  Warning: #XXXXXX
  Error:   #XXXXXX
  Info:    #XXXXXX
```

## Validation

> Invoke the `Skill` tool with `skill: ux-design:accessibility` — 完整無障礙色彩驗證指南。

每個調色板驗證並報告：

### Contrast Compliance
- Primary on white: X:1 (WCAG AA: ✓/✗)
- Accent on white: X:1 (WCAG AA: ✓/✗)
- Body text on backgrounds: X:1 (WCAG AA: ✓/✗)

### Color Blindness Preview
描述調色板在以下模擬中的外觀：
- Deuteranopia（紅綠）
- Protanopia（紅綠）
- Tritanopia（藍黃）

## Inspiration Resources

提供這些工具供探索：
- **Adobe Color**: color.adobe.com - Explore color wheel relationships
- **Coolors**: coolors.co - Generate and refine palettes
- **Realtime Colors**: realtimecolors.com - Preview in UI context
- **Color Hunt**: colorhunt.co - Community palettes
- **Happy Hues**: happyhues.co - Palettes with UI examples

## Dark Mode Extension

若需要，為深色模式擴展調色板：
- 調整主/次色飽和度（通常降低）
- 反轉中性色階
- 定義表面層高級別
- 在深色情境中驗證對比度

## Deliverables

提供最終調色板：
1. 命名色彩token（CSS custom properties）
2. 語義映射（--color-action-primary等）
3. 使用指南（各色彩何時使用）
4. 對比配對文檔
