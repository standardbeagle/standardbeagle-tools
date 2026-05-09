---
name: ux-design-iconography
description: "Icon design principles, selection criteria, and system creation. Build cohesive icon sets that enhance usability and reinforce brand identity. 圖示設計原則、選擇準則與系統建立：構建增強可用性、強化品牌識別的一致圖示集。 Use when: selecting or designing icons, building icon system, defining icon sizing or accessibility requirements, choosing between icon libraries."
disable-model-invocation: true
---

# Iconography Design

汝乃圖示設計專家，助設計師選擇、創建、系統化增強可用性與視覺識別的圖示。

## Philosophy

圖示是視覺速記。有效的圖示設計：

1. **Communicates instantly** - 一瞥即明含義
2. **Supports text** - 增強，不取代標籤
3. **Maintains consistency** - 全程同一視覺語言
4. **Scales gracefully** - 從12px到64px+均有效

## When to Use Icons

### Icons Add Value When

- **Space is limited** - 移動端導航、工具欄、密集UI
- **Scanning is primary** - 列表、菜單、儀表板
- **Recognition aids recall** - 用戶習得的重複操作
- **Universal concepts** - 搜索、主頁、設置、關閉

### Icons Cause Problems When

- **Concept is abstract** - 「協同」、「效率」
- **Meaning is ambiguous** - 可能有多種解讀
- **Text is clearer** - 「帳戶設置」vs齒輪圖示
- **Users are unfamiliar** - 新概念、新產品

### The Hybrid Approach

**Best practice**: 圖示 + 文字標籤
- 圖示輔助掃描
- 文字確保清晰
- Tooltip作為僅圖示的回退
- 關鍵操作未經測試不得僅用圖示

## Icon Styles

### Line Icons (Outline)

```
Characteristics:
- Strokes without fills
- Consistent stroke weight
- Open, airy feel

Best for:
- Modern, minimal interfaces
- Text-heavy environments
- Smaller sizes (less visual weight)

Examples: Heroicons, Feather Icons
```

### Solid Icons (Filled)

```
Characteristics:
- Filled shapes
- Strong visual presence
- Higher contrast

Best for:
- Navigation (selected state)
- High-emphasis needs
- Larger sizes
- Dark backgrounds

Examples: Font Awesome (solid), Material Symbols (filled)
```

### Duotone Icons

```
Characteristics:
- Two color layers
- Primary and secondary tones
- Depth and dimension

Best for:
- Marketing materials
- Feature highlights
- Illustrative uses

Examples: Font Awesome Pro (duotone)
```

### Illustrated Icons

```
Characteristics:
- Custom artwork
- Brand-specific style
- Higher detail

Best for:
- Empty states
- Onboarding
- Feature marketing
- Brand differentiation

Caution: Don't mix with utility icons
```

## Icon Anatomy

### Key Measurements

**Canvas Size**（基礎網格）:
- 16x16、20x20、24x24（常見）
- 32x32、48x48、64x64（較大用途）

**Optical Boundary**（內容區域）:
- 圓/方：填充至邊緣
- 高形狀：留水平內距
- 寬形狀：留垂直內距
- 目標：視覺平衡，非像素相等

**Stroke Weight**:
- 全集一致
- 典型：1px、1.5px、2px
- 與圖示大小成比例縮放

**Corner Radius**:
- 全集一致
- 與品牌角落風格匹配
- 較尖 = 更技術感
- 較圓 = 更友好

### Optical Corrections

**Visual Weight Balance**:
- 相同尺寸下圓形看起來比方形小
- 圓形縮放至約103%獲得視覺等效
- 三角形需要額外調整

**Centering**:
- 視覺中心 ≠ 幾何中心
- 向右的箭頭：略向右偏移
- 播放圖示：向右偏移約10%

## Creating an Icon System

### Define Style Guidelines

**Document These**:
```
Canvas: 24x24px with 2px padding
Stroke: 2px, round caps, round joins
Corner: 2px radius
Alignment: Pixel-perfect at 24px
Colors: Single color (inherits from text)
```

### Consistency Rules

**Visual Consistency**:
- 全處筆畫寬度相同
- 相同圓角半徑
- 相同細節程度
- 相同比喻風格（具象vs抽象）

**Semantic Consistency**:
- 箭頭始終意味著導航
- X始終意味著關閉
- 加號始終意味著添加
- 齒輪始終意味著設置

### Size Variants

**Why Different Sizes**:
- 細節不線性縮放
- 12px需要簡化
- 48px可增加細節

**Typical Set**:
```
12px - Minimal (status indicators)
16px - Compact (inline with text)
20px - Default (buttons, nav)
24px - Standard (primary actions)
32px - Large (feature icons)
48px - Hero (marketing, empty states)
```

## Icon Selection Criteria

### Recognition Testing

**Can Users Identify It?**:
- 無標籤測試
- 多選：「這是什麼意思？」
- 若<70%正確，加文字標籤

**Universally Recognized**:
- 放大鏡 = 搜索
- 房子 = 主頁
- 信封 = 電子郵件
- 齒輪/齒輪 = 設置
- 人物 = 帳戶/個人資料

**Context-Dependent**:
- 漢堡菜單（≡）= 菜單（習得）
- 心形 = 喜歡 OR 收藏 OR 保存
- 鈴鐺 = 通知
- 星形 = 收藏 OR 評分

### Cultural Considerations

**Icons with cultural variance**:
- 郵箱樣式（美國vs國際）
- 貨幣符號
- 手勢（豎拇指、OK手勢）
- 宗教/精神符號
- 顏色含義（紅色、白色）

**Safe Universal Concepts**:
- 箭頭（方向）
- 加/減（添加/移除）
- X（關閉）
- 勾選（確認）

## Icon + Text Patterns

### Positioning

**Leading Icon**（文字前）:
```
[🔍] Search        [+] Add Item
```
- 最常見模式
- 從左到右流向

**Trailing Icon**（文字後）:
```
Settings [⚙️]      More [▶]
```
- 指示操作/狀態
- 下拉箭頭、外部鏈接

**Stacked Icon**（文字上方）:
```
  [🏠]
  Home
```
- 標籤欄、底部導航
- 功能卡片

### Spacing

**Icon-to-Text Gap**:
- 通常8px（space-2）
- 調整以達到視覺平衡
- 小文字更緊，大文字更寬

**Alignment**:
- 圖示與文字x高度居中對齊
- 可能需要視覺調整（1-2px）

## Accessibility Requirements

> Invoke the `Skill` tool with `skill: ux-design:accessibility` — 完整的圖示無障礙實施指南。

### Icon-Only Buttons

**Must Have**:
- aria-label 描述操作
- 懸停/焦點時的Tooltip
- sr-only 文字替代

**Example**:
```
<button aria-label="Close dialog">
  <span class="sr-only">Close dialog</span>
  <XIcon aria-hidden="true" />
</button>
```

### Decorative Icons

**When icon has text**:
```
<button>
  <SearchIcon aria-hidden="true" />
  Search
</button>
```
- 圖示為裝飾（文字提供含義）
- 對屏幕閱讀器隱藏

### Focus Visibility

- 圖示按鈕的焦點環
- 觸摸目標：最小44x44px
- 可見的懸停/激活狀態

## Icon Resources

### Free Icon Libraries

**Heroicons** (heroicons.com)
- By Tailwind Labs
- Outline and solid
- 24px and 20px
- MIT license

**Lucide** (lucide.dev)
- Fork of Feather
- Actively maintained
- Many variants
- ISC license

**Phosphor** (phosphoricons.com)
- 6 weights
- Consistent style
- MIT license

**Tabler Icons** (tabler-icons.io)
- 3000+ icons
- Stroke-based
- MIT license

**Material Symbols** (fonts.google.com/icons)
- Google's system
- Variable font
- Multiple styles
- Apache 2.0

### Premium Icons

**Font Awesome Pro**
- Massive library
- Multiple styles
- Support included

**Streamline**
- Multiple styles
- High quality
- Regular updates

**Noun Project**
- Millions of icons
- Various artists
- License per icon or subscription

### Custom Icon Tools

**Figma** - Vector design, icon creation
**Illustrator** - Professional vector
**IconJar** - Icon organization (Mac)
**Nucleo** - Icon management

## Icon System Checklist

### Creating Icons

- [ ] 定義了一致的畫布大小
- [ ] 筆畫寬度一致
- [ ] 圓角半徑一致
- [ ] 已應用視覺校正
- [ ] 在所有目標尺寸測試
- [ ] 單色有效
- [ ] 比喻清晰
- [ ] 風格與品牌匹配

### Implementing Icons

- [ ] 所有圖示來自同一集
- [ ] 提供無障礙標籤
- [ ] 裝飾性圖示對AT隱藏
- [ ] 觸摸目標充足
- [ ] 焦點狀態可見
- [ ] 各情境尺寸一致
- [ ] 顏色適當繼承
- [ ] 考慮了加載狀態

### Documentation

- [ ] 風格指南已記錄
- [ ] 每個圖示的使用指南
- [ ] 尺寸建議已注明
- [ ] 顏色使用已定義
- [ ] 無障礙要求已列出
- [ ] 做/不做示例已包含

## Common Mistakes

**Mixing Icon Sets**
- 不同風格衝突
- 不一致的筆畫寬度
- 細節程度不同

**Overusing Icons**
- 每個標籤都有圖示
- 無含義的圖示
- 裝飾優先於功能

**Size Inconsistency**
- 同一情境中不同大小
- 未為尺寸調整細節
- 忽略視覺尺寸

**Missing Labels**
- 僅圖示的關鍵操作
- 假設通用識別
- 圖示按鈕無Tooltip

**Poor Contrast**
- 圖示過淡
- 未在背景上測試
- 激活狀態不足
