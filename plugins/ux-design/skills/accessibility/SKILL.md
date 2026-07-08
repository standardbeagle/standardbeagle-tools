---
name: ux-design-accessibility
description: "Inclusive design + WCAG guidelines for accessible experiences. Covers visual, motor, cognitive, auditory accessibility from design perspective. 無障礙設計與WCAG指南。 Use when: reviewing designs for accessibility, implementing WCAG compliance, designing focus states, handling color independence, ensuring touch target sizing."
disable-model-invocation: true
---

# Accessibility Design Principles

汝乃無障礙專家，助設計師創建對所有人有效的包容性體驗，包括殘障人士。

## Philosophy

無障礙非功能——乃設計品質。無障礙設計：

1. **Serves everyone** - 臨時和情境性殘障影響我們所有人
2. **Improves usability** - 幫助某些人的，往往幫助所有人
3. **Is a legal requirement** - ADA、Section 508、EAA強制合規
4. **Expands your audience** - 15-20%人口有殘障

## Understanding Disabilities

### Visual

**Blindness**
- 完全視力喪失
- 完全依賴屏幕閱讀器
- 通過鍵盤和音頻導航

**Low Vision**
- 視覺清晰度降低
- 可能使用屏幕放大
- 需要高對比、大字體

**Color Blindness**
- 無法區分某些顏色
- 紅綠最常見（8%男性）
- 藍黃較少見

### Motor

**Limited Fine Motor Control**
- 精確動作困難
- 需要更大點擊目標
- 鍵盤優先於鼠標

**Tremors**
- 手部動作不穩
- 需要穩定、容錯的目標
- 操作的時間延伸

**Single Hand Use**
- 臨時或永久
- 鍵盤快捷鍵必須單手可用
- 移動端觸摸區域很重要

### Cognitive

**Attention Disorders**
- 難以保持專注
- 被動作/雜亂分心
- 需要清晰、簡單的佈局

**Memory Impairments**
- 難以保留信息
- 識別優於回憶
- 持久的狀態和情境

**Learning Disabilities**
- 處理挑戰
- 簡單語言有幫助
- 多種內容格式

### Auditory

**Deafness**
- 無法訪問音頻內容
- 需要視覺替代
- 字幕和文字稿必不可少

**Hard of Hearing**
- 部分聽力喪失
- 需要音量控制
- 清晰音頻配字幕

## WCAG Principles (POUR)

### Perceivable

信息必須以用戶可感知的方式呈現。

**Text Alternatives**
- 圖片的替代文字
- 視頻的字幕
- 音頻的文字稿

**Adaptable Content**
- 以編程方式傳達結構
- 閱讀順序合理
- 內容不依賴感官特性

**Distinguishable**
- 前景/背景分離
- 文字可調整大小
- 顏色非含義的唯一傳遞者

### Operable

界面組件必須對所有用戶可操作。

**Keyboard Accessible**
- 所有功能可通過鍵盤訪問
- 無鍵盤陷阱
- 邏輯焦點順序

**Enough Time**
- 可調整的時間限制
- 動作的暫停/停止/隱藏
- 無時間依賴內容

**Seizure Prevention**
- 無每秒超過3次閃爍
- 閃爍面積限制
- 動效減少選項

**Navigable**
- 跳過導航鏈接
- 描述性頁面標題
- 焦點可見

### Understandable

信息和操作必須可理解。

**Readable**
- 識別語言
- 解釋不尋常詞彙
- 展開縮寫

**Predictable**
- 一致的導航
- 一致的識別
- 無意外情境變化

**Input Assistance**
- 錯誤識別
- 標籤和說明
- 重要操作的錯誤預防

### Robust

內容必須足夠健壯以供輔助技術使用。

**Compatible**
- 有效標記
- 正確命名和角色
- 狀態消息可訪問

## Color Accessibility

> Invoke the `Skill` tool with `skill: ux-design:color-theory` — 系統化調色板生成與對比度管理。

### Contrast Requirements

**WCAG AA (Minimum)**
```
Normal text:     4.5:1
Large text:      3:1  (18pt or 14pt bold)
UI components:   3:1
Graphics:        3:1
```

**WCAG AAA (Enhanced)**
```
Normal text:     7:1
Large text:      4.5:1
```

### Color Independence

永不單靠顏色傳達：
- 錯誤（加圖示+文字）
- 必填字段（加星號+文字）
- 鏈接（加下劃線）
- 狀態（加形狀或文字）
- 圖表中的數據系列（加圖案）

**Good Example**:
```
Error state: Red border + error icon + error message
Not just: Red border alone
```

### Color Blindness Testing

用以下模擬設計：
- Deuteranopia（紅綠，最常見）
- Protanopia（紅綠）
- Tritanopia（藍黃）
- Achromatopsia（無色）

Tools: Stark (Figma), Sim Daltonism (Mac), Chrome DevTools

## Typography Accessibility

> Invoke the `Skill` tool with `skill: ux-design:typography` — 可讀性優化與字體選擇的詳細指南。

### Readable Text

**Size**
- 正文：最小16px（1rem）
- 小字：最小12px（謹慎使用）
- 用戶必須能縮放至200%

**Line Length**
- 最佳45-75字符
- 最多80字符
- 用max-width限制

**Line Height**
- 正文最小1.5
- 段落間距：最小字號的1.5倍

**Letter Spacing**
- 永不低於默認值
- 小字或全大寫需更寬

### Font Choices

**Accessible Font Characteristics**:
- 清晰的字母形狀區分（I、l、1）
- 開放的字母內空間（a、e、o）
- 一致的筆畫寬度
- 適當的x高度

**Fonts Known for Accessibility**:
- Atkinson Hyperlegible（為低視力設計）
- Open Sans
- Verdana
- Tahoma

**Avoid**:
- 正文的裝飾字體
- 300以下的細字重
- 極度壓縮寬度
- 內容的手寫/書法字體

### Text Styling

**Don't Rely Solely On**:
- 斜體強調（難以閱讀）
- 顏色標記鏈接
- 刪除線（可能不被宣讀）

**Do Use**:
- 粗體強調
- 鏈接的下劃線
- 清晰的視覺區分

## Focus States

### Visibility Requirements

焦點指示器必須：
- 可見（最小3:1對比度）
- 清晰（非僅顏色變化）
- 明顯（用戶可找到焦點元素）

### Focus Design

**Good Focus Styles**:
```
Outline: 2px solid, offset 2-4px
Ring: High contrast color
Background: Color change + outline
```

**Never Remove Focus Without Replacement**:
```css
/* DON'T */
:focus { outline: none; }

/* DO */
:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--focus-color);
}
```

### Focus Management

**Focus Order**:
- 邏輯的，遵循視覺佈局
- 從左到右、從上到下（LTR語言）
- 模態焦點限於模態內

**Skip Links**:
- 第一個可焦點元素
- "Skip to main content"
- "Skip to navigation"

## Touch Accessibility

### Target Sizes

**WCAG 2.2 Requirements**:
- Minimum: 24x24px
- Recommended: 44x44px
- Spacing: 8px between targets

### Touch Target Design

- 內距計入觸摸目標
- 行內鏈接需垂直間距
- 圖示按鈕需足夠內距
- 靠近屏幕邊緣 = 更易點擊

### Gesture Alternatives

每個手勢均提供替代方案：
- Swipe → 按鈕
- Pinch zoom → 按鈕/滑塊
- Drag → 點擊/輕觸替代
- Long press → 菜單/按鈕

## Motion & Animation

### Reduced Motion

遵守`prefers-reduced-motion`：
- 減少或移除非必要動畫
- 保留功能性過渡（狀態變化）
- 避免視差效果
- 無自動播放視頻

**What to Reduce**:
- 裝飾性動畫
- 視差滾動
- 大幅度移動過渡
- 彈跳/縮放效果

**What to Keep**:
- 狀態變化指示器
- 加載反饋
- 簡單的透明度淡入淡出
- 微交互（細微的）

### Motion Guidelines

- Duration: 200-500ms for UI
- 避免閃爍（每秒最多3次）
- 允許暫停所有動畫
- 無法停止的動作不存在

## Form Accessibility

### Labels

每個輸入需要：
- 關聯標籤（以編程方式鏈接）
- 可見標籤（非僅佔位符）
- 描述性文字

**Label Placement**:
- 在輸入上方或左側
- 整個表單一致
- 複選框/單選按鈕：標籤在右側

### Instructions & Errors

**Before Input**:
- 必填字段指示器（含圖例）
- 格式期望
- 字符限制

**During Input**:
- 實時驗證（可選但有益）
- 清晰的錯誤狀態

**After Submission**:
- 字段附近的錯誤，非僅匯總
- 清晰的修正路徑
- 焦點移至第一個錯誤

### Grouping

相關字段應：
- 視覺分組
- 以編程方式分組（fieldset/legend）
- 邏輯排序

## Icon & Image Accessibility

### Icons

**Decorative Icons**（文字旁）:
- 對輔助技術隱藏
- aria-hidden="true"

**Functional Icons**（獨立的）:
- 需要無障礙名稱
- aria-label 或 sr-only 文字
- 考慮tooltip提高可發現性

**Icon + Text**:
- 圖示為裝飾（隱藏）
- 文字提供含義

### Images

**Decorative Images**:
- 空alt：alt=""
- 無有用信息傳遞

**Informative Images**:
- 描述性替代文字
- 描述功能，非外觀
- 125字符或更少

**Complex Images**（圖表、示意圖）:
- 簡短替代文字
- 附近或鏈接的長描述
- 考慮數據表替代

## Designing for Screen Readers

### Content Order

視覺順序應與DOM順序匹配：
- 最重要內容在前
- 邏輯閱讀順序
- 標題創建結構

### Heading Structure

```
h1 - Page title (one per page)
  h2 - Major sections
    h3 - Subsections
      h4 - Further divisions
```

永不為視覺樣式跳過層級。

### Meaningful Structure

**Lists** 用於項目組
**Tables** 用於表格數據
**Landmarks** 用於頁面區域
**Links** 脫離情境也應有意義

## Mobile Accessibility

### Screen Reader Gestures

為滑動導航設計：
- 線性內容順序
- 有意義的分組
- 轉子可訪問元素

### Orientation

- 支持縱向和橫向
- 兩種方向均有關鍵內容
- 無理由不鎖定方向

### Viewport

- 縮放未被禁用
- 最小支持320px
- 文字隨系統設置縮放

## Testing Checklist

### Quick Checks

- [ ] 顏色對比通過（文字4.5:1，UI 3:1）
- [ ] 顏色非唯一指示器
- [ ] 所有互動元素焦點可見
- [ ] 觸摸目標最小44x44px
- [ ] 文字縮放至200%無損失
- [ ] 標題層次邏輯
- [ ] 圖片有適當替代文字
- [ ] 表單有可見標籤
- [ ] 錯誤清晰識別
- [ ] 跳過鏈接存在

### Tools

**Contrast Checkers**:
- WebAIM Contrast Checker
- Stark (Figma plugin)
- Colour Contrast Analyser (desktop)

**Screen Readers**:
- VoiceOver (Mac/iOS)
- NVDA (Windows, free)
- JAWS (Windows)
- TalkBack (Android)

**Automated Testing**:
- axe DevTools (browser)
- WAVE (browser)
- Lighthouse (Chrome)

## Resources

### Guidelines
- **WCAG 2.2** (w3.org/WAI/WCAG22/quickref)
- **ARIA Authoring Practices** (w3.org/WAI/ARIA/apg)
- **Inclusive Components** (inclusive-components.design)

### Learning
- **A11y Project** (a11yproject.com)
- **Deque University** (dequeuniversity.com)
- **WebAIM** (webaim.org)

### Design Resources
- **Stark** (getstark.co) - Design tool plugins
- **Accessibility Insights** (accessibilityinsights.io)
- **Who Can Use** (whocanuse.com) - Color contrast visualization

## Related

- 設計期無障礙決策交予開發實作叢集：`ux-developer:a11y-check`（真實頁審計+修復碼）、`ux-developer:wcag-guidelines`（準則參考）、`ux-developer:screen-reader`、`ux-developer:keyboard-navigation`、`ux-developer:touch-targets`（跨 plugin 接力）。
