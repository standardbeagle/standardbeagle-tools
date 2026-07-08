---
name: ux-design-visual-hierarchy
description: "Layout composition, visual weight distribution, and attention flow. Create designs that guide users effortlessly through content with intentional hierarchy. 佈局構圖、視覺重量分配與注意力流：以意圖層次引導用戶無障礙瀏覽。 Use when: establishing visual priority, composing page layouts, directing user attention, evaluating whether hierarchy is clear."
disable-model-invocation: true
---

# Visual Hierarchy & Layout Composition

汝乃視覺設計專家，助人創建引導視線、建立清晰優先級、以視覺手段傳遞結構的佈局。

## Philosophy

每個設計都有視覺敘事。層次確保用戶：

1. **See what matters first** - 主要內容主導注意力
2. **Navigate effortlessly** - 結構不言自明
3. **Understand relationships** - 分組傳遞含義
4. **Know what to do** - 操作可通過重要性發現

## The Hierarchy Toolkit

建立視覺層次的五種主要工具：

### 1. Size

**最有力的差異化工具。**

- 較大元素率先吸引注意
- 大小差異必須有意義（非僅10%）
- 在比例中建立清晰的大小「停頓點」

**Size Ratios That Work**:
```
Extreme contrast:  3:1 or greater
Strong contrast:   2:1
Moderate contrast: 1.5:1
Subtle contrast:   1.25:1
```

**Application**:
- 標題 vs 正文（最小2:1）
- 主要CTA vs 次要（1.5:1）
- 特色內容 vs 輔助內容

### 2. Color & Contrast

**通過色彩強調引導注意力。**

- 高對比 = 高注意力
- 中性背景上的飽和色 = 焦點
- 深色在淺色上（反之亦然）用於文字層次

**Contrast Strategies**:
```
Value contrast:      Light vs. dark
Saturation contrast: Vivid vs. muted
Hue contrast:        Complementary colors
Temperature:         Warm vs. cool
```

**Application**:
- 主要按鈕：中性背景上的品牌色
- 鏈接：與正文有區別
- 錯誤：紅色立即引起注意
- 禁用：降低對比表示不可操作

> Invoke the `Skill` tool with `skill: ux-design:color-theory` — 色彩層次與對比管理的深入指南。

### 3. Position & Placement

**視線入口點與閱讀模式。**

**Reading Patterns**:

*F-Pattern（文字密集）*
- 頂部強水平移動
- 下方次要水平掃描
- 沿左邊緣垂直掃描

*Z-Pattern（內容極簡）*
- 左上到右上
- 對角線到左下
- 左下到右下

*Gutenberg Diagram（均衡）*
- 主要視覺區域：左上
- 強空白區：右上
- 弱空白區：左下
- 終端區：右下（CTA放置）

**Application**:
- 標誌/品牌：左上（首先被看到）
- 主要CTA：終端區或強空白區
- 最重要內容：折疊以上
- 漸進揭示：從上到下

### 4. Whitespace (Negative Space)

**空白是設計元素，非浪費空間。**

- 空白隔離並強調
- 充裕的邊距提升重要性
- 擁擠的佈局削弱層次

**Whitespace Techniques**:
```
Macro whitespace: Large gaps between sections
Micro whitespace: Spacing within components
Active whitespace:  Intentionally directs attention
Passive whitespace: Results from layout structure
```

**Application**:
- 英雄區：充裕的內距
- 高端感：更多留白
- 數據密集：戰略性微間距
- 分隔優於邊框：用空間劃分

### 5. Typography

**文字樣式創造內在層次。**

> Invoke the `Skill` tool with `skill: ux-design:typography` — 排版層次系統的詳細指南。

**Typographic Hierarchy**:
```
Weight:     Bold vs. regular
Size:       Large vs. small
Case:       Uppercase (labels) vs. sentence
Style:      Italic for emphasis
Family:     Display vs. body
Color:      Black vs. gray
```

**Application**:
- 標題：更大、更粗、更深
- 正文：舒適的閱讀大小
- 說明：更小、更淡
- 標籤：通常大寫、帶間距

## Compositional Structures

### Grid Systems

**Why Grids Matter**:
- 創建對齊和一致性
- 建立視覺節奏
- 支持響應式行為
- 減少任意決策

**Common Grid Types**:

*12-Column Grid*
- 最大靈活性
- 均勻分割：1、2、3、4、6、12
- 響應式網頁標準

*8-Point Grid*
- 所有間距為8的倍數
- 圖示、文字、元件對齊
- 設備間乾淨縮放

*Modular Grid*
- 水平AND垂直分割
- 用於複雜、結構化佈局
- 雜誌、儀表板設計

### Layout Patterns

**Single Column**
- 專注於內容流
- 最適合閱讀、移動端
- 最少干擾

**Split/Two Column**
- 圖片+文字
- 導航+內容
- 側邊欄模式

**Cards**
- 獨立、可掃描單元
- 靈活重排
- 等大或變化尺寸

**Asymmetric**
- 創造視覺興趣
- 通過不平衡強調
- 需要技巧執行

**Masonry**
- 動態、內容驅動
- 適合多樣媒體
- 保持對齊

### Rule of Thirds

將畫布分為3x3網格。關鍵元素位於交叉點或沿線創造動感、悅目的構圖。

**Power Points**: 四個交叉點是自然焦點區域。

### Golden Ratio (1:1.618)

尋求古典比例者：
- 寬高關係
- 內容區域與側邊欄
- 圖片裁剪

## Creating Clear Hierarchy

### The Squint Test

模糊視野（或字面上模糊設計）。應仍能看到：
- 主要焦點
- 主要分組
- 大體結構

若一切模糊在一起：層次失敗。

### One Primary Per Level

在層次的每一層，ONE個元素應主導：
- 頁面上一個主要標題
- 每個屏幕一個主要操作
- 列表中一個特色項目

多個「主要」造成競爭和混亂。

### Hierarchy Levels

在設計中建立一致的層次：

```
Level 1: Page/Screen Title (largest, boldest)
Level 2: Section Headers
Level 3: Subsection Headers
Level 4: Content Groups
Level 5: Body Content
Level 6: Supporting/Meta Content
```

## Grouping & Relationships

### Gestalt Application

**Proximity**
- 近 = 相關
- 使用一致的間距
- 間隙大小表示關係

```
Group A      Gap      Group B
[item] [item]  |  [item] [item]
  2px gap      |    8px gap between groups
```

**Similarity**
- 相同樣式 = 相同類別
- 顏色、大小、形狀、紋理
- 打破相似性以強調

**Enclosure**
- 容器分組內容
- 卡片、框、背景
- 最強分組方法

**Common Region**
- 共享背景分組元素
- 行分組的交替顏色
- 節背景

### Visual Separation Methods

**從最強到最弱**:
1. 不同表面/頁面
2. 全出血分隔線
3. 背景色變化
4. 粗邊框/線
5. 細邊框/線
6. 僅留白

偏好最弱的有效方法——減少視覺噪音。

## Attention Flow

### Entry Points

視線最先落在何處？通過以下控制：
- 大小（最大元素）
- 位置（左上或中心）
- 顏色（最飽和）
- 動態（若有）
- 人臉（進化吸引力）

### Guided Paths

引導視線通過預期序列：
- 數字或步驟
- 箭頭和線條
- 顏色漸進
- 大小梯度
- 對齊路徑

### Exit Points

用戶最終應在何處操作？
- CTA應在終端/完成區域
- 次要操作在附近但降調
- 路徑應感覺完整，非突然

## Common Hierarchy Patterns

### Hero Sections

```
[        Brand/Logo        ]
[                          ]
[     LARGE HEADLINE       ]
[     Supporting text      ]
[     [Primary CTA]        ]
[                          ]
```

- 標題最大尺寸
- 單一、清晰的CTA
- 輔助文字銜接標題到操作

### Content Lists

```
[ Image ] [ Title (bold, larger)    ]
[       ] [ Subtitle (lighter)      ]
[       ] [ Meta info (smallest)    ]
          [ [Action] ]
```

- 每項結構一致
- 主要信息率先掃描
- 操作可訪問但不主導

### Forms

```
Field Label (small, above or left)
[ Input Field (prominent) ]
Helper text (smallest, muted)
```

- 標籤引導，輸入接收焦點
- 錯誤適當地打破層次
- 按鈕跟隨表單完成

### Dashboards

```
[ Key Metric ][ Key Metric ][ Key Metric ]
[          Primary Chart                  ]
[ Secondary ] [ Secondary ]
[ Table/List with data                    ]
```

- 最重要數據在頂部
- 主要可視化主導
- 輔助細節在下方

## Dark Mode Hierarchy

層次原則不變，但實現有所不同：

- 深色背景上的淺色文字 = 反轉強調
- 深色背景上明亮色彩感覺更響亮
- 用層高（亮度）分層
- 陰影效果較弱；用表面顏色替代

## Testing Your Hierarchy

### Questions to Ask

1. 首先看到什麼？（應符合意圖）
2. 其次看到什麼？（應為下一優先級）
3. 主要操作是什麼？（應顯而易見）
4. 什麼屬於同一組？（分組應清晰）
5. 什麼可以忽略？（次要內容應退後）

### Hierarchy Audit Checklist

- [ ] 單一、清晰的主要焦點
- [ ] 一致的標題層次
- [ ] 主要操作最突出
- [ ] 相關項目視覺分組
- [ ] 間距建立分組
- [ ] 色彩強調節制使用
- [ ] 眯眼測試通過
- [ ] 閱讀模式已考慮
- [ ] 留白支撐結構
- [ ] 無色彩亦有效（為無障礙性）

## Resources

### Layout Inspiration
- **Mobbin** (mobbin.com) - Real app screenshots
- **Land-book** (land-book.com) - Landing pages
- **Awwwards** (awwwards.com) - Award-winning designs

### Grid Tools
- **Grid Calculator** (gridcalculator.dk)
- **Modular Scale** (modularscale.com)
- **8-Point Grid** (spec.fm/specifics/8-pt-grid)

### Composition Theory
- **The Art of Layout** - Various books
- **Grid Systems in Graphic Design** - Josef Müller-Brockmann
- **Making and Breaking the Grid** - Timothy Samara

## Related

- `ux-developer:content-hierarchy` — 姊妹視角：本技藝主視覺重量/構圖/注意力流，彼主語義標題層級與 IA（h1–h6/地標/可掃描）。設計定重點，開發定語義結構，二者宜對齊（跨 plugin）。
