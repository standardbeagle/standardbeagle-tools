---
name: ux-design-responsive-patterns
description: "Responsive design strategies, breakpoint systems, and adaptive layout patterns. Create designs that work beautifully across all devices and contexts. 響應式設計策略、斷點系統與自適應佈局模式：跨設備情境的美觀設計。 Use when: designing layouts for multiple screen sizes, defining breakpoint systems, adapting navigation for mobile, handling responsive tables or images."
disable-model-invocation: true
---

# Responsive Design Patterns

汝乃響應式設計專家，助人創建在設備、方向和情境間優雅適配的佈局。

## Philosophy

響應式設計在於為情境適當呈現內容：

1. **Content first** - 最重要的內容在任何地方均有效
2. **Progressive enhancement** - 從簡單出發，為能力添加複雜性
3. **Fluid over fixed** - 擁抱媒介的靈活性
4. **Test real devices** - 模擬器會撒謊

## Breakpoint Strategy

### Common Breakpoints

```
320px  - Small phones (iPhone SE, older devices)
375px  - Standard phones (iPhone, modern Android)
428px  - Large phones (iPhone Pro Max)
768px  - Tablets portrait
1024px - Tablets landscape, small laptops
1280px - Laptops, small desktops
1440px - Standard desktops
1920px - Large desktops
2560px - Ultra-wide/4K
```

### Recommended System

**Minimum Viable Breakpoints**:
```
sm:  640px  - Large phones
md:  768px  - Tablets
lg:  1024px - Laptops
xl:  1280px - Desktops
```

**Extended System**:
```
xs:  475px  - Large phones
sm:  640px  - Small tablets
md:  768px  - Tablets
lg:  1024px - Laptops
xl:  1280px - Desktops
2xl: 1536px - Large screens
```

### Breakpoint Design Principles

**為斷點範圍設計，非特定設備**:
- 設備不斷變化
- 斷點應反映佈局需求，非設備規格
- 內容斷裂時添加斷點，非在任意寬度

**移動優先方式**:
- 從最小佈局出發
- 隨空間增加複雜性
- 默認樣式為移動端；媒體查詢添加更大的

## Layout Patterns

### Column Drop

小屏幕垂直堆疊，大屏幕水平展開。

```
Mobile:          Desktop:
[ A ]            [ A ] [ B ] [ C ]
[ B ]
[ C ]
```

**When to use**:
- 市場營銷頁面
- 功能比較
- 卡片網格

### Layout Shifter

斷點間佈局發生重大變化。

```
Mobile:          Tablet:          Desktop:
[ Head ]         [ Head  ]        [ Nav ][ Content ]
[ Nav  ]         [ Nav   ]        [     ][ Sidebar ]
[ Main ]         [ Main  ]
[ Side ]         [ Side  ]
```

**When to use**:
- 複雜應用
- 儀表板
- 多節頁面

### Mostly Fluid

內容區域有最大寬度，大屏幕邊距增長。

```
Small:           Large:
[  Content  ]    [    ][Content][    ]
full-width       centered + margins
```

**When to use**:
- 閱讀導向內容
- 博客、文章
- 簡單應用

### Off-Canvas

部分內容隱藏在屏幕外直至觸發。

```
Mobile:                    Mobile (nav open):
[≡][ Title ]              [ Nav   ][Title ]
[ Content   ]             [ Link  ][      ]
                          [ Link  ][      ]
```

**When to use**:
- 移動端導航
- 篩選面板
- 次要內容

### Tiny Tweaks

微小調整；無重大重組。

```
Mobile:          Desktop:
Same layout      Same layout
smaller text     larger text
```

**When to use**:
- 簡單、單列內容
- 極簡界面
- 性能關鍵網站

## Navigation Patterns

### Hamburger → Full Nav

```
Mobile:               Desktop:
[≡]                   [Home][About][Services][Contact]
↓ (on tap)
[Home]
[About]
[Services]
[Contact]
```

**Considerations**:
- 漢堡菜單損害可發現性
- 考慮移動應用的底部導航
- Priority+模式作為替代

### Priority+ Navigation

最重要的項目可見；溢出到「更多」菜單。

```
Narrow:               Wide:
[Home][About][⋮]      [Home][About][Svc][Port][Contact]
```

**When to use**:
- 導航項目多
- 重要性可變
- 空間受限的標題

### Bottom Navigation (Mobile)

```
[🏠][🔍][➕][👤][≡]
Home Search Add Profile More
```

**Guidelines**:
- 最多3-5個項目
- 僅頂級目標
- 圖示+標籤
- 拇指可達區域

### Tab Bar vs. Hamburger

**Tab Bar**（iOS風格）:
- 始終可見
- 直接訪問
- 有限項目（最多5個）

**Hamburger**:
- 需要時才顯示
- 無限項目
- 較低可發現性

## Content Adaptation

### Images

**Responsive Images**:
- 不同視口不同尺寸
- 藝術指導（為情境裁剪）
- 格式適配（支持時使用WebP）

**Strategies**:
```
srcset: Different sizes
sizes:  When to use each size
<picture>: Art direction, format fallbacks
```

### Typography

**Fluid Typography**:
```
font-size: clamp(16px, 4vw, 24px);
```

**Scale Compression**:
- 移動端更緊比例（1.2）
- 桌面端更大比例（1.25-1.333）

**Line Length**:
- 限制max-width提高可讀性
- 無論屏幕大小，65ch為最優

> Invoke the `Skill` tool with `skill: ux-design:typography` — 字體比例與響應式排版的詳細指南。

### Tables

**Options for Responsive Tables**:

*Horizontal scroll*
- 表格獨立滾動
- 適用於數據表

*Card transformation*
- 每行變為卡片
- 標籤/值對堆疊

*Column hiding*
- 優先列可見
- 其他在可展開行中

*Reflow*
- 列變為行
- 標題變為標籤

### Forms

**Adaptations**:
- 移動端堆疊標籤（輸入框上方）
- 桌面端行內標籤（輸入框左側）
- 移動端全寬輸入
- 各平台優化的日期選擇器
- 觸摸友好的選擇菜單

## Touch vs. Pointer

### Target Sizing

```
Touch minimum:    44x44px
Mouse optimum:    24x24px (can be smaller)
```

**Adaptive Approach**:
- 默認為觸摸尺寸
- 精確指針設備可減小（如需）
- @media (pointer: fine) { }

### Hover States

```css
/* Only apply hover on devices that support it */
@media (hover: hover) {
  .button:hover {
    background: var(--hover-color);
  }
}
```

**Touch alternatives**:
- 長按用於Tooltip
- 輕觸一次預覽，再次激活
- 滑動用於附加操作

### Spacing

觸摸界面需要：
- 目標間更多內距
- 手勢的充足邊距
- 舒適的拇指可達間距

## Viewport Considerations

### Safe Areas

現代設備有缺口、圓角：
- env(safe-area-inset-top)
- env(safe-area-inset-bottom)
- env(safe-area-inset-left)
- env(safe-area-inset-right)

**Always account for**:
- iPhone notch
- Home indicator bar
- Android system bars

### Viewport Height

**100vh problem**:
- 移動端瀏覽器顯示/隱藏UI
- 100vh導致跳動

**Solutions**:
- 100dvh（動態視口高度）
- 100svh（小視口高度）
- JavaScript測量

### Orientation

**Portrait vs. Landscape**:
- 平板：重大佈局變化
- 手機：通常設計為僅縱向
- 若體驗損壞則考慮鎖定

## Responsive Patterns Library

### Hero Sections

```
Mobile:                    Desktop:
[      Image       ]       [  Text   ][   Image    ]
[   Headline       ]       [  CTA    ][            ]
[   CTA            ]
```

### Card Grids

```
Mobile:   Tablet:    Desktop:
[Card]    [C1][C2]   [C1][C2][C3][C4]
[Card]    [C3][C4]
[Card]
[Card]
```

**Grid behavior**:
- 1列 → 2 → 3 → 4
- 最大項目自動填充
- 保持最小卡片寬度

### Sidebars

```
Mobile:                Desktop:
[Content      ]        [Sidebar][Content     ]
[Button: More ]        [       ][            ]
      ↓
[Sidebar (overlay)]
```

**Patterns**:
- 可折疊抽屜
- 帶疊加的off-canvas
- 標籤欄替換
- 內容中的手風琴

### Data Tables

```
Mobile (cards):        Desktop (table):
┌─────────────┐       | Name | Role | Status |
│ John Smith  │       | John | Dev  | Active |
│ Developer   │       | Jane | PM   | Active |
│ Active      │
└─────────────┘
```

## Testing Strategy

### Device Testing Priorities

**Must Test**:
1. 最常見手機（iPhone、Samsung）
2. 流行平板（iPad）
3. 標準桌面
4. 常見筆記本尺寸

**Should Test**:
- 邊緣尺寸（320px、4K）
- 多種瀏覽器
- 不同方向
- 慢速連接

### Debugging Approach

1. 持續調整瀏覽器大小（非僅捕捉到特定尺寸）
2. 識別佈局斷裂處
3. 在斷裂點添加斷點（非設備尺寸）
4. 用真實設備測試觸摸行為

## Performance Considerations

### Mobile Performance

- 移動端更小圖片
- 推遲非關鍵CSS
- 減少JavaScript負載
- 懶加載折疊以下內容

### Connection-Aware Design

```css
/* Reduce motion/animation on slow connections */
@media (prefers-reduced-data: reduce) {
  img { filter: blur(5px); }
}
```

**Strategies**:
- 低分辨率圖片佔位符
- 圖片前先顯示文字
- 關鍵內容優先

## Design Deliverables

### Artboards to Produce

**Minimum**:
- 375px (mobile)
- 768px (tablet)
- 1440px (desktop)

**Extended**:
- 320px (small mobile)
- 375px (mobile)
- 768px (tablet)
- 1024px (small desktop)
- 1440px (desktop)
- 1920px (large desktop)

### Documentation

每個斷點指定：
- 網格列數和間距
- 排版比例變化
- 導航行為
- 元件適配
- 圖片尺寸
- 間距變化

## Resources

### Testing Tools
- **Chrome DevTools** - Device emulation
- **Responsively** (responsively.app) - Multi-device view
- **BrowserStack** - Real device testing

### Pattern Libraries
- **Responsive Patterns** (responsivedesign.is/patterns)
- **Brad Frost Patterns** (bradfrost.com/blog/post/responsive-nav-patterns)

### Layout Tools
- **CSS Grid Generator** (cssgrid-generator.netlify.app)
- **Flexbox Froggy** (flexboxfroggy.com) - Learning tool

## Related

- `ux-developer:mobile-first` — 重疊之斷點/響應視角：本技藝主響應式策略與自適應佈局設計，彼主移動優先實作與觸控/性能（跨 plugin 對照）。
