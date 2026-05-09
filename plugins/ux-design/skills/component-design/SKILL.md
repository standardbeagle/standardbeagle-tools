---
name: ux-design-component-design
description: "Design principles for creating cohesive component libraries and design systems. Covers component anatomy, state design, variant systems, and scalable design patterns. 設計系統元件庫之法：解剖、狀態、變體、規模化。 Use when: designing a component library, defining component states or variants, planning a design system, establishing spacing or elevation tokens."
disable-model-invocation: true
---

# Component Library Design

汝乃設計系統專家，助人建立齊整可擴展之元件庫。元件設計者，將設計決策固化為可複用、有文檔之模式。

## Philosophy

元件庫之功：

1. **Enable consistency** - 同一模式，無例外
2. **Accelerate design** - 元件為積木，非束縛
3. **Scale without pattern breakdown** - 從單頁至企業應用皆有效
4. **Communicate clearly** - 任何設計師皆可理解使用

## Before Designing Components

### Strategic Questions

**Scope & Scale**
- 幾多產品或介面將用此系統？
- 幾多設計師將貢獻？
- 維護承諾如何？
- 從頭建還是改編現有系統？

**Brand Integration**
- 各產品視覺差異幾許？
- 嚴格統一抑或主題化？
- 何者不可變（核心品牌）、何者可適（本地化）？

**Technical Reality**
- 須支援哪些平台？（web、iOS、Android、desktop）
- 框架限制何在？
- 設計工具偏好？（Figma、Sketch等）

## Component Anatomy

每個元件有五層需設計：

### 1. Structure (Layout)

**Container**
- 邊界尺寸（固定、流動、內容適配）
- 內距模型（一致的間距token）
- 佈局方向（橫、縱、換行）

**Slots**
- 內容命名區域（icon-start、label、icon-end）
- 可選與必要元素
- 排列與定位規則

### 2. Visual Style

**Surface**
- 各狀態背景色
- 邊框屬性（寬度、顏色、圓角）
- 陰影與層高

**Content**
- 排版（適用哪些文字樣式）
- 顏色（文字、圖示填充）
- 尺寸（圖示、頭像等）

### 3. Interactive States

**Standard States**
```
Default     → Base appearance
Hover       → Cursor over (pointer devices)
Focus       → Keyboard focus (visible ring)
Active      → Being pressed/clicked
Selected    → Chosen state (toggles, radios)
Disabled    → Non-interactive
Loading     → Async operation in progress
Error       → Validation failure
```

**State Transitions**
- 哪些過渡有動畫？
- 過渡持續時間與緩動
- 狀態間哪些屬性變化？

### 4. Content Model

**What goes inside?**
- 必要元素（按鈕的標籤）
- 可選元素（圖示、徽章）
- 禁止的組合

**Content Guidelines**
- 文字長度限制
- 截斷行為
- 換行規則
- 本地化考量

### 5. Behavioral Specifications

**Interactions**
- 點擊行為
- 鍵盤導覽
- 觸摸手勢
- 拖拽交互

**Responsive Behavior**
- 如何適應視口？
- 斷點特定變體
- 最小/最大尺寸

## Component Categories

### Foundation (Primitives)

**Purpose**: 最底層積木

**Examples**:
- Box（含間距、顏色、邊框的容器）
- Text（帶樣式的排版）
- Icon（圖示包裝器）
- Image（響應式圖片）
- Stack（縱橫佈局）
- Cluster（換行flex佈局）

**Design Principle**: 最大靈活性，最少主觀

### Elements (Atoms)

**Purpose**: 單功能UI件

**Examples**:
- Button
- Input Field
- Checkbox/Radio
- Toggle Switch
- Badge
- Avatar
- Tag/Chip
- Divider

**Design Principle**: 一職，精通

### Patterns (Molecules)

**Purpose**: 組合元素服務特定目的

**Examples**:
- Search Field（input + icon + button）
- Form Field（label + input + helper text）
- Menu Item（icon + text + keyboard shortcut）
- List Item（avatar + content + actions）
- Card（image + content + actions）
- Toast/Notification

**Design Principle**: 解決常見組合

### Compositions (Organisms)

**Purpose**: 複雜、自足的UI區域

**Examples**:
- Navigation Bar
- Data Table
- Modal Dialog
- Dropdown Menu
- Form Section
- Sidebar
- Comment Thread

**Design Principle**: 為工作流程編排模式

### Templates (Layouts)

**Purpose**: 頁面級結構

**Examples**:
- Dashboard Layout
- Detail Page
- Settings Page
- Empty State
- Loading State
- Error State

**Design Principle**: 支撐頁面構建

## Variant Systems

### When to Create Variants

變體為設計時選擇，創造不同外觀：

**Size Variants**
```
Button.size: xs | sm | md | lg | xl
```
- 不同情境需不同突出度
- 觸摸目標vs密集介面

**Style Variants**
```
Button.variant: solid | outline | ghost | link
```
- 主次重要性
- 視覺層次與對比需求

**Color Variants**
```
Button.color: primary | secondary | danger | success
```
- 語義意義或強調
- 品牌應用點

### Variant Design Principles

**Minimize Variants**
- 每個變體均是維護負擔
- 問：「此為真正差異，還是懶惰？」

**Consistent Variant Semantics**
- "sm"在所有元件中含義相同
- "danger"始終對應同一顏色

**Combinable Without Conflict**
- 所有變體維度可乾淨組合
- 測試：Button.size="sm" + Button.variant="outline" + Button.color="danger"

## State Design Matrix

為每個元件製作所有狀態矩陣：

```
           | Default | Hover | Focus | Active | Disabled |
-----------+---------+-------+-------+--------+----------|
Background | gray-50 | gray-100 | gray-50 | gray-200 | gray-25 |
Border     | gray-200 | gray-300 | blue-500 | gray-400 | gray-100 |
Text       | gray-900 | gray-900 | gray-900 | gray-900 | gray-400 |
Cursor     | pointer | pointer | default | pointer | not-allowed |
```

### State Design Guidelines

**Hover**
- 微妙變化（非劇烈）
- 指示可交互性
- 背景移位或邊框強調

**Focus**
- 高可見度（無障礙關鍵）
- 系統內一致的焦點環
- 2px+高對比色環
- 永不單靠顏色

**Active/Pressed**
- 提供觸感反饋
- 更深/凹陷外觀
- 進入狀態的短暫過渡

**Disabled**
- 降低對比（但仍可讀）
- 移除可交互提示
- Cursor: not-allowed
- 考慮：禁用狀態是否應可見？

**Loading**
- 替換內容還是疊加？
- 轉圈位置
- 保持尺寸（防止布局偏移）

## Spacing System

### Space Tokens

使用一致的比例：

```
space-0:   0
space-0.5: 0.125rem (2px)
space-1:   0.25rem  (4px)
space-2:   0.5rem   (8px)
space-3:   0.75rem  (12px)
space-4:   1rem     (16px)
space-5:   1.25rem  (20px)
space-6:   1.5rem   (24px)
space-8:   2rem     (32px)
space-10:  2.5rem   (40px)
space-12:  3rem     (48px)
space-16:  4rem     (64px)
```

### Spacing Application

**Padding (Internal)**
- 內容與邊緣的縮進
- 依元件尺寸而異

**Gap (Between Children)**
- 元件內一致
- 通常為單一token值

**Margin (External)**
- 通常為零（父元素控制佈局）
- 使用時，取自間距比例

## Iconography Integration

### Icon Sizing

圖示尺寸與排版及間距對齊：

```
Icon.size: sm (16px) | md (20px) | lg (24px) | xl (32px)
```

### Icon + Text Alignment

- 圖示應在視覺上與文字基線對齊
- 可能需要細微偏移調整
- 圖示與文字間距：通常space-2（8px）

### Icon-Only Components

- 需無障礙標籤（aria-label）
- 懸停時通常需要tooltip
- 觸摸目標：最小44x44px

## Elevation & Layering

### Elevation Tokens

```
elevation-0: flat (no shadow)
elevation-1: subtle lift (cards, buttons on hover)
elevation-2: raised (dropdowns, popovers)
elevation-3: high (modals, dialogs)
elevation-4: highest (toast notifications)
```

### Shadow Design

為每個層高定義：
- 偏移（x, y）
- 模糊半徑
- 擴散
- 顏色（通常為低透明度黑色）

深色模式考量：陰影可能需改為較亮疊加。

## Border Radius System

### Radius Tokens

```
radius-none: 0
radius-sm:   0.125rem (2px)
radius-md:   0.25rem  (4px)
radius-lg:   0.5rem   (8px)
radius-xl:   0.75rem  (12px)
radius-2xl:  1rem     (16px)
radius-full: 9999px   (pill/circle)
```

### Application Rules

- 較小元素 → 較小圓角
- 嵌套元素 → 比父元素更小圓角
- 同類元件圓角一致

## Documentation Requirements

每個元件需要：

### 1. Purpose Statement
此解決何問題？何時使用？

### 2. Anatomy Diagram
所有部件的視覺分解

### 3. Variant Gallery
所有變體與示例

### 4. State Examples
每個狀態的可視化

### 5. Usage Guidelines
- 這樣做
- 不要這樣做
- 何時使用vs替代方案

### 6. Content Guidelines
文字建議、字符限制

### 7. Accessibility Notes
ARIA模式、鍵盤交互模型

### 8. Related Components
可考慮哪些替代方案？

## Quality Checklist

> Invoke the `Skill` tool with `skill: ux-design:accessibility` — 核驗無障礙合規性。

對每個元件驗證：

- [ ] 所有狀態已設計並文檔化
- [ ] 所有變體可協同工作
- [ ] 間距使用系統token
- [ ] 顏色使用系統token
- [ ] 排版使用系統token
- [ ] 焦點狀態可見且無障礙
- [ ] 觸摸目標達44px最小值
- [ ] 文字隨瀏覽器設置縮放
- [ ] 元件在RTL佈局中有效
- [ ] 深色模式變體存在
- [ ] 響應式行為已定義
- [ ] 加載狀態已設計
- [ ] 錯誤狀態已設計
- [ ] 空狀態已設計
- [ ] 鍵盤交互已定義
- [ ] 屏幕閱讀器行為已定義

## Design System Resources

### Inspiration & Reference

- **Primer** (primer.style) - GitHub's system
- **Carbon** (carbondesignsystem.com) - IBM's system
- **Polaris** (polaris.shopify.com) - Shopify's system
- **Atlassian Design** (atlassian.design) - Atlassian's system
- **Material Design** (material.io) - Google's system
- **Lightning Design** (lightningdesignsystem.com) - Salesforce's system

### Component Patterns

- **Component Gallery** (component.gallery) - Real component examples
- **UI Patterns** (ui-patterns.com) - UX pattern library
- **Design Systems Repo** (designsystemsrepo.com) - Curated systems list

### Design Token Management

- **Style Dictionary** - Token transformation
- **Figma Variables** - Native design tool tokens
- **Tokens Studio** - Figma plugin for tokens
