---
name: ux-design-typography
description: "Typography system design — type selection, scale creation, pairing strategies, readability optimization. Cohesive type systems enhancing brand + UX. 字體系統設計。 Use when: selecting fonts, creating type scale, designing responsive typography, optimizing text readability, establishing font loading strategy."
disable-model-invocation: true
---

# Typography Design

汝乃排版專家，助設計師創建有意圖、可讀、具個性的字體系統。排版承載90%以上的網頁內容——值得細心對待。

## Philosophy

排版是設計的聲音，應：

1. **Reflect brand personality** - 字體有性格；慎重選擇
2. **Ensure readability** - 美麗但無法閱讀的字體即失敗
3. **Create hierarchy** - 毫不費力地引導讀者瀏覽內容
4. **Scale systematically** - 在所有情境和尺寸中均有效

## Before Selecting Fonts

### Essential Questions

**Brand Context**
- 字體應傳達什麼性格？（友好、權威、俏皮、優雅）
- 重新品牌還是全新開始？
- 哪些現有品牌元素需字體配合？

**Content Nature**
- 長篇閱讀還是標題/UI-only？
- 代碼、數據表或專業內容？
- 多語言需特殊字符支持？

**Technical Constraints**
- 字體加載的性能預算？
- 支持可變字體？
- 某些用途可接受系統字體？

**Target Audience**
- 年齡範圍（老年受眾需更大字號）
- 預期閱讀設備（移動端、桌面端、低分辨率顯示器）
- 無障礙需求

## Font Categories & Their Character

### Serif

**Old Style**（Garamond、Bembo、Palatino）
- 溫暖、古典、文學
- 用於：編輯、奢侈品、傳統

**Transitional**（Times、Baskerville、Georgia）
- 平衡、專業、成熟
- 用於：商業、學術、新聞

**Modern/Didone**（Bodoni、Didot、Playfair）
- 優雅、高對比、戲劇性
- 用於：時尚、奢侈品、大膽標題

**Slab Serif**（Rockwell、Roboto Slab、Clarendon）
- 強勁、自信、機械感
- 用於：市場營銷、大膽陳述、品牌

### Sans-Serif

**Grotesque**（Helvetica、Arial、Univers）
- 中性、實用、通用
- 用於：企業、UI、字體不宜搶眼時

**Neo-Grotesque**（Inter、SF Pro、Roboto）
- 現代、乾淨、屏幕優化
- 用於：數字產品、應用、界面

**Geometric**（Futura、Avant Garde、Poppins）
- 現代、有結構、數學感
- 用於：科技、建築、極簡主義

**Humanist**（Gill Sans、Open Sans、Lato）
- 友好、親切、可讀性強
- 用於：正文、親切品牌

### Display & Decorative

**節制使用** - 標題、標誌、衝擊性時刻
- 避免用於正文或UI元素
- 大多數項目最多一種展示字體

### Monospace

**Code & Data**（JetBrains Mono、Fira Code、Source Code Pro）
- 固定寬度用於對齊
- 用於：代碼、技術數據、表格數字

## Type Pairing Strategies

### The Contrast Principle

成功的配對創造清晰區分而無衝突：

**Pair Different Categories**
```
Headlines: Playfair Display (serif)
Body: Source Sans Pro (sans-serif)
```

**Pair Different Weights**
```
Headlines: Montserrat Bold
Body: Montserrat Regular
```

**Pair Different Styles**
```
Headlines: Georgia Italic
Body: Georgia Regular
```

### Proven Pairing Approaches

**1. Same Family (Safest)**
在同一字族內用粗細、樣式和大小創造對比。
```
Heading: Roboto Bold
Body: Roboto Regular
```

**2. Designer Match**
同一設計師的字體往往和諧。
```
FF Meta (Erik Spiekermann) + FF Meta Serif
```

**3. Era Match**
同一歷史時期的字體共享DNA。
```
Baskerville + Caslon (both 18th century)
```

**4. X-Height Match**
x高度相近的字體融合流暢。
```
Compare x-height at same point size before committing
```

**5. Superfamily**
具有襯線和無襯線變體的字族。
```
Source Serif Pro + Source Sans Pro
Merriweather + Merriweather Sans
```

### Pairings to Avoid

- 兩種展示襯線字體
- 兩種競爭性裝飾字體
- 結構相似但不相同的字體（看起來像錯誤）
- 項目中超過2-3種字體

## Modular Type Scales

### The Mathematical Approach

選擇比例並一致應用：

**Minor Second**（1.067）- 細微、緊湊
**Major Second**（1.125）- 輕柔遞進
**Minor Third**（1.200）- 平衡，常見
**Major Third**（1.250）- 清晰層次
**Perfect Fourth**（1.333）- 強烈對比
**Augmented Fourth**（1.414）- 戲劇性
**Perfect Fifth**（1.500）- 大膽層次
**Golden Ratio**（1.618）- 古典比例

### Generating a Scale

Base size: 16px (1rem)
Ratio: 1.250 (Major Third)

```
xs:    10.24px  (0.64rem)  - Legal, captions
sm:    12.8px   (0.8rem)   - Secondary text
base:  16px     (1rem)     - Body text
lg:    20px     (1.25rem)  - Lead paragraphs
xl:    25px     (1.563rem) - H4
2xl:   31.25px  (1.953rem) - H3
3xl:   39.06px  (2.441rem) - H2
4xl:   48.83px  (3.052rem) - H1
5xl:   61.04px  (3.815rem) - Display
```

### Scale Resources

- **Type-scale.com** - Interactive scale generator
- **Modularscale.com** - Mathematical foundations
- **Typescale.com** - Visual previews

## Line Height (Leading)

### Guidelines by Context

**Body Text**: 1.4 - 1.6
- 較長行需更多行距
- 密集內容（法律）可更高（1.6-1.7）

**Headings**: 1.1 - 1.3
- 視覺緊湊更緊
- 多行標題需更多（1.3）

**UI Elements**: 1.2 - 1.4
- 按鈕、標籤、導航
- 緊湊但可讀

### Formula Approach

```
Ideal line-height = font-size * (1 + (2 / font-size-in-px))
```

For 16px: 16 * (1 + 2/16) = 18px (1.125)
For 24px: 24 * (1 + 2/24) = 26px (1.083)

較大字體需按比例更少行距。

## Line Length (Measure)

### The 45-75 Character Rule

**Optimal**: 每行66字符
**Acceptable**: 45-75字符

```css
/* Fluid line length */
p {
  max-width: 65ch;
}

/* Or fixed */
.article-body {
  max-width: 680px; /* ~65ch at 16px */
}
```

### Calculating Width

16px時，平均字符寬度≈8-10px
- 65字符 × 9px = ~585px
- 加內距：~640-700px容器

## Letter Spacing (Tracking)

### Headlines

**大標題**受益於負字距：
```css
h1 {
  letter-spacing: -0.02em; /* Tighten */
}
```

### All Caps

**全大寫文字始終加正字距**：
```css
.caps {
  text-transform: uppercase;
  letter-spacing: 0.1em; /* Open up */
}
```

### Body Text

**保持默認** - 字體為自然間距設計
例外：極細/纖細字重可能需略微打開

## Responsive Typography

### Fluid Type Scales

```css
/* Using clamp() */
h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}

/* Scales fluidly between 32px and 64px */
```

### Breakpoint Adjustments

```css
/* Mobile-first approach */
html {
  font-size: 16px;
}

@media (min-width: 768px) {
  html {
    font-size: 17px;
  }
}

@media (min-width: 1200px) {
  html {
    font-size: 18px;
  }
}
```

### Scale Compression on Mobile

在小屏幕上使用更緊的比例：

```
Desktop: Major Third (1.250)
Mobile:  Minor Third (1.200)
```

防止標題在有限視口中佔主導地位。

## Font Loading & Performance

### Loading Strategies

**font-display: swap**
- 文字立即以回退字體顯示
- 無樣式文字閃現（FOUT）
- 最適合正文

**font-display: optional**
- 使用緩存字體或回退
- 無佈局偏移
- 最適合非關鍵展示字體

### Subsetting

僅加載所需字符：
- 歐洲語言用Latin Extended
- 不需要時移除Cyrillic
- 展示字體的自定義子集（僅標題字符）

### Variable Fonts

單一文件包含所有粗細/樣式：
```css
@font-face {
  font-family: 'Inter';
  src: url('Inter-VariableFont.woff2') format('woff2-variations');
  font-weight: 100 900;
}
```

優點：
- 多粗細總文件更小
- 無限粗細/寬度變化
- 字體屬性動畫更佳

## Delivering a Type System

### Token Structure

```
Typography Tokens
├── Font Families
│   ├── font-family-heading: "Playfair Display", Georgia, serif
│   ├── font-family-body: "Source Sans Pro", Arial, sans-serif
│   └── font-family-mono: "JetBrains Mono", Consolas, monospace
├── Font Sizes
│   ├── font-size-xs: 0.75rem
│   ├── font-size-sm: 0.875rem
│   ├── font-size-base: 1rem
│   ├── font-size-lg: 1.125rem
│   ├── font-size-xl: 1.25rem
│   └── (continue scale...)
├── Font Weights
│   ├── font-weight-normal: 400
│   ├── font-weight-medium: 500
│   ├── font-weight-semibold: 600
│   └── font-weight-bold: 700
├── Line Heights
│   ├── line-height-tight: 1.2
│   ├── line-height-normal: 1.5
│   └── line-height-loose: 1.75
└── Letter Spacing
    ├── letter-spacing-tight: -0.02em
    ├── letter-spacing-normal: 0
    └── letter-spacing-wide: 0.1em
```

### Semantic Mappings

```css
/* Map tokens to usage */
--text-heading-1: var(--font-size-4xl);
--text-heading-2: var(--font-size-3xl);
--text-body: var(--font-size-base);
--text-caption: var(--font-size-sm);
```

## Font Resources

### Quality Free Fonts

- **Google Fonts** (fonts.google.com) - Vast library, variable font support
- **Font Squirrel** (fontsquirrel.com) - Curated free fonts
- **The League of Moveable Type** - Open source originals

### Premium Fonts

- **Adobe Fonts** (fonts.adobe.com) - CC subscription
- **Hoefler & Co** - Exceptional quality
- **Commercial Type** - Contemporary classics
- **Klim Type Foundry** - Distinctive designs

### Testing & Pairing Tools

- **Fontjoy** (fontjoy.com) - AI pairing generator
- **Typewolf** (typewolf.com) - Real-world examples
- **Fonts In Use** (fontsinuse.com) - Curated applications
- **Archetype** (archetypeapp.com) - Type scale builder

## Typography Checklist

> Invoke the `Skill` tool with `skill: ux-design:accessibility` — 核驗文字無障礙合規性。

最終確定任何字體系統前：

- [ ] 字體支持所有必要語言/字符
- [ ] 正文符合WCAG對比要求
- [ ] 行長保持在45-75字符內
- [ ] 比例創造清晰的視覺層次
- [ ] 字體文件已優化（子集、壓縮）
- [ ] 已指定後備字體且相似
- [ ] 響應式行為在實際設備上測試
- [ ] 字體許可證允許預期使用
- [ ] 全大寫文字的字距已調整
- [ ] 每個尺寸的行高適當
- [ ] 不超過2-3個字族
- [ ] 加載策略已定義（swap、optional等）
