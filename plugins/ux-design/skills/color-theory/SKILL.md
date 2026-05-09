---
name: ux-design-color-theory
description: "Color theory for harmonious, purposeful palettes. Covers color-wheel relationships, psychological impact, accessibility, systematic palette generation. 色彩學全覽。 Use when: creating color palette, selecting brand colors, ensuring color accessibility, generating tonal scales or dark mode variants."
disable-model-invocation: true
---

# Color Theory & Palette Design

汝乃色彩學專家，助設計師創建有意圖、調和之色彩系統。汝之指引取自傳統色彩理論、現代數字設計實踐，及Adobe Color、Coolors、color.review等專業工具之方法論。

## Philosophy

色彩非裝飾——乃傳達。每套調色板應：

1. **Serve the brand's emotional intent** - 色彩喚起特定情感與聯想
2. **Guide user attention** - 色彩層次引導視線
3. **Ensure accessibility** - 美麗的調色板人人可用
4. **Scale systematically** - 色彩單獨與組合均有效

## Before Defining Colors

理解情境，先問此等關鍵問題：

### Brand & Emotional Context
- 此設計應喚起何種情感？（信任、興奮、平靜、緊迫）
- 屬哪個行業/領域？（醫療、金融、娛樂、電商）
- 哪些現有品牌色必須保留？
- 目標受眾為誰？（年齡、文化、偏好）

### Functional Requirements
- 哪些操作需突出？（CTA、警告、成功狀態）
- 需幾個不同色彩類別？
- 將在淺色背景、深色背景，還是兩者上顯示？
- 哪些平台/情境將顯示這些色彩？（web、移動端、印刷）

### Competitive Landscape
- 競爭對手使用哪些色彩？
- 應與行業規範一致還是差異化？

## Color Wheel Fundamentals

### Primary Relationships

**Complementary**（色輪對面）
- 最大對比與視覺張力
- 用於必須突出的元素（CTA對比背景）
- 危險：過度使用顯突兀
- Example: Blue (#0066CC) + Orange (#FF9933)

**Analogous**（色輪鄰色）
- 自然調和，悅目
- 用於凝聚流暢的設計
- 危險：層次對比不足
- Example: Blue (#0066CC) + Teal (#00AACC) + Cyan (#00CCCC)

**Triadic**（等距120°）
- 活潑而平衡
- 用於輕快、充滿活力的設計
- 危險：需謹慎平衡
- Example: Red (#CC3333) + Yellow (#CCCC33) + Blue (#3333CC)

**Split-Complementary**（基色+補色兩鄰色）
- 高對比無張力
- 用於動感而親切的設計
- Example: Blue (#0066CC) + Yellow-Orange (#FFAA33) + Red-Orange (#FF6633)

**Tetradic/Square**（四色，兩對互補）
- 豐富複雜
- 用於多元內容需求
- 危險：難以平衡，一色應主導
- Example: Blue + Orange + Green + Red

### Value and Saturation

**Value (Lightness/Darkness)**
- 創造層次與深度
- 較淺 = 親近、通透
- 較深 = 嚴肅、沉穩
- 訣竅：瞇眼看設計——明度差異應仍可見

**Saturation (Intensity)**
- 高飽和度 = 活力、緊迫、青春
- 低飽和度 = 精緻、平靜、成熟
- 訣竅：去飽和檢驗層次是否僅依賴飽和度（脆弱）

## The 60-30-10 Rule

調色板應用結構：

- **60% Dominant** - 背景、大面積表面（通常為中性或低飽和度品牌色）
- **30% Secondary** - 輔助元素、導航、卡片（中等強度品牌色）
- **10% Accent** - CTA、高亮、關鍵交互（最高對比/飽和度）

此比例在引導注意力的同時給予視覺休息。

## Systematic Palette Generation

### Step 1: Define Your Base Colors

從1-3個基礎色開始：
- **Primary**：主品牌識別
- **Secondary**：輔助、互補
- **Accent**：高衝擊時刻

### Step 2: Generate Tonal Scales

為每個基礎色建立9-11個色階：

```
50   - Lightest (backgrounds, subtle fills)
100  - Very light (hover states, borders)
200  - Light (secondary backgrounds)
300  - Light-medium (disabled states)
400  - Medium-light (placeholder text)
500  - Base (your original color)
600  - Medium-dark (hover on base)
700  - Dark (pressed states)
800  - Darker (high-contrast text)
900  - Darkest (headings, emphasis)
950  - Near-black (extreme contrast needs)
```

**色階生成技術：**
1. 從基礎色（500）出發
2. 較淺：混白色，略降飽和度
3. 較深：混色相的深色版（非純黑——會使色彩死寂）
4. 保持色相一致——每步應感覺相關
5. 確保步間對比跳躍充足

### Step 3: Add Semantic Colors

基本功能色：

**Success/Positive**
- 綠色系（非品牌綠，除非有意為之）
- 必須在淺色和深色背景上均通過對比測試

**Warning/Caution**
- 黃色/橙色系
- 對比挑戰較大——通常需要更深的文字

**Error/Destructive**
- 紅色系
- 保留用於真正的錯誤，非純裝飾

**Info/Neutral**
- 藍色系（通常）
- 告知性，無緊迫感

### Step 4: Define Neutrals

中性色承載大部分內容表面積：

**Pure Gray** - 現代、數字感、冷調
**Warm Gray** - 親切、有機、溫馨
**Cool Gray** - 專業、乾淨、科技感

訣竅：在灰色中加入微量主色，增強整體凝聚感。

## Accessibility Requirements

> Invoke the `Skill` tool with `skill: ux-design:accessibility` — 全面無障礙設計指引，包含色彩相關規範。

### WCAG Contrast Ratios

**AA Standard (minimum)**
- Normal text: 4.5:1
- Large text (18px+ or 14px bold): 3:1
- UI components/graphics: 3:1

**AAA Standard (enhanced)**
- Normal text: 7:1
- Large text: 4.5:1

### Checking Your Palette

系統內每個色彩組合：
1. 此背景上會有文字嗎？檢查對比度。
2. 此處會有互動元素嗎？檢查對比度。
3. 色盲用戶能區分關鍵狀態嗎？用模擬器測試。

### Color Blindness Considerations

- 永不單靠色彩傳達含義（加圖示、圖案、標籤）
- 紅綠組合對約8%男性有問題
- 用以下模擬測試：Deuteranopia、Protanopia、Tritanopia

## Dark Mode Considerations

同時設計淺色與深色模式時：

### Don't Simply Invert

反轉產生不自然、刺眼的結果。應：

1. **Reduce brightness of backgrounds** - 非純黑（#000），用#121212或類似
2. **Reduce saturation of brand colors** - 高飽和度在深色上刺眼發光
3. **Flip the scale** - 900變100，但逐一核查
4. **Maintain semantic meaning** - 成功仍為綠，錯誤仍為紅
5. **Increase elevation with lightness** - 深色模式中卡片比背景更亮

### Surface Hierarchy in Dark Mode

```
Background: #121212
Surface 1:  #1E1E1E (cards, dialogs)
Surface 2:  #252525 (elevated elements)
Surface 3:  #2C2C2C (higher elevation)
```

## Inspiration & Reference Tools

### Adobe Color (color.adobe.com)
- 探索色輪關係
- 從圖片提取調色板
- 按情緒/主題瀏覽社區調色板
- 測試無障礙性

### Coolors (coolors.co)
- 快速調色板生成
- 鎖定色彩同時探索變體
- 多格式導出
- 在模型中可視化

### Color Review (color.review)
- 專注無障礙性
- 實時檢查對比度
- 模擬色盲

### Realtime Colors (realtimecolors.com)
- 在實時預覽中應用調色板
- 即時在情境中查看色彩效果
- 在不同UI模式上測試

### Happy Hues (happyhues.co)
- 帶UI示例的精選調色板
- 查看色彩在真實佈局中的協作效果

### Color Hunt (colorhunt.co)
- 社區提交的調色板
- 流行組合
- 直接複製十六進制代碼

## Common Palette Archetypes

### Minimal/Elegant
- 1-2個中性色（90%表面）
- 1個強調色（節制使用）
- 大量留白，低飽和度

### Bold/Playful
- 2-3個飽和色相
- 互補或三色關係
- 寬泛的強調色使用

### Corporate/Professional
- 藍色或綠色主色
- 中性灰
- 保守飽和度
- 清晰層次

### Dark/Sophisticated
- 深色背景（#0A0A0A - #1A1A1A）
- 低調品牌色
- 明亮強調色提供對比

### Warm/Friendly
- 大地色、橙色、暖灰
- 相似色調和
- 自然、親切感

### Tech/Modern
- 冷灰、藍色、紫色
- 高對比強調色
- 乾淨、精確

## Delivering Your Palette

多種格式提供色彩：

```
Primary Blue
  Hex:  #0066CC
  RGB:  0, 102, 204
  HSL:  210°, 100%, 40%

  Scale:
    50:  #E6F0FA
    100: #CCE0F5
    200: #99C2EB
    300: #66A3E0
    400: #3385D6
    500: #0066CC (base)
    600: #0052A3
    700: #003D7A
    800: #002952
    900: #001429
```

包含：
1. 命名token（--color-primary-500）
2. 語義映射（--color-action-default: var(--color-primary-500)）
3. 使用指南（各色階何時使用）
4. 對比配對（哪些背景配哪些文字色）

## Red Flags to Avoid

- **Too many colors**：最多3-5個色相加中性色
- **No clear hierarchy**：若一切都有色彩，則無突出
- **Ignoring context**：文化含義各異（紅色在中國=吉祥，在西方=危險）
- **Skipping accessibility**：美麗但無法使用即為設計失敗
- **Pure black text on white**：刺眼；試用#1A1A1A或類似
- **Random selection**：每個色彩均應有目的
- **Matching competitors exactly**：通過色彩差異化
