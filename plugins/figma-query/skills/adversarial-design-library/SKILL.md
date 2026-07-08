---
name: figma-query-adversarial-design-library
description: "Adversarial cooperation loop for creating complete design library from Figma with CSS, assets, HTML mockups, and documentation. 對抗式協作循環，從 Figma 生成完整設計庫：CSS、資產、HTML、文檔。 Use when: extracting complete design library, running adversarial quality verification loop, creating production-ready component library from Figma, full design-to-code extraction"
disable-model-invocation: true
---

# Adversarial Design Library Loop (Ralph Wiggum Pattern)

提取器與驗證器持續在挑戰-驗證循環中協作，從 Figma 生成生產就緒設計庫。驗證器積極挑戰每次提取，提取器應答並改進。

## Mission

提取完整、生產就緒的設計庫，包含：
- **Exact Figma CSS** - 逐像素樣式提取
- **Original Assets** - 所有圖像、圖標、圖形
- **HTML Mockups** - 可實施的 HTML/CSS
- **Comprehensive Documentation** - 組件、頁面、章節文檔

## Core Principles

### Context-Sized Extraction
每次提取任務須：
- **Bounded**：每次單一組件或章節
- **Measurable**：明確輸出產物
- **Verifiable**：可對照 Figma 核查
- **Isolated**：無對未提取元素的依賴

### Plan Adjustment Protocol
每階段末**自動**執行：
1. 審查已提取內容
2. 依新發現更新剩余項
3. 若發現問題則重新排優
4. 記錄調整
5. 除非 BLOCKED，**立即繼續**至下一階段

```yaml
plan_adjustment_rules:
  automatic_continuation:
    description: "Phase transitions are automatic"
    behavior: "Adjust plan silently and continue"

  when_to_stop:
    - "Missing Figma access (token invalid)"
    - "Component references missing components"
    - "Critical style extraction failure"
    - "Asset export completely fails"

  when_to_continue:
    - "Minor CSS differences (note and continue)"
    - "Missing optional assets (skip and note)"
    - "Token resolution warnings (continue)"
    - "Variant discovery (add to queue, continue)"

  never_ask:
    - "Should I continue?"
    - "Is this acceptable?"
    - "Ready for next component?"
```

---

## Eagle-Eyed Violations (IMMEDIATE REJECTION)

驗證器須**嚴格拒絕**以下違規。

### 1. CSS Accuracy Violations
```yaml
css_violations:
  missing_properties:
    - "Any visual property not extracted"
    - "Layout properties omitted"
    - "Spacing values missing"
    verdict: "REJECT - extract all visible properties"

  value_inaccuracy:
    - "Color values don't match Figma"
    - "Font sizes differ from source"
    - "Spacing values incorrect"
    verdict: "REJECT - values must be exact"

  structure_mismatch:
    - "HTML structure doesn't match hierarchy"
    - "Missing nested elements"
    - "Incorrect parent-child relationships"
    verdict: "REJECT - structure must mirror Figma"
```

### 2. Asset Completeness Violations
```yaml
asset_violations:
  missing_assets:
    - "Icons not exported"
    - "Background images omitted"
    - "Patterns not included"
    verdict: "REJECT - all assets required"

  quality_issues:
    - "Rasterized vectors (should be SVG)"
    - "Wrong scale exported"
    - "Missing retina versions"
    verdict: "REJECT - correct format/scale required"

  naming_issues:
    - "Inconsistent naming"
    - "No semantic names"
    - "Missing organization"
    verdict: "REJECT - follow naming convention"
```

### 3. Documentation Violations
```yaml
doc_violations:
  incomplete_docs:
    - "Missing component description"
    - "No usage examples"
    - "Properties undocumented"
    verdict: "REJECT - complete documentation required"

  inaccurate_docs:
    - "CSS doesn't match code"
    - "Screenshots out of date"
    - "Wrong token references"
    verdict: "REJECT - docs must be accurate"

  structure_violations:
    - "Missing README.md"
    - "Wrong file organization"
    - "No index/manifest"
    verdict: "REJECT - follow structure template"
```

### 4. HTML Mockup Violations
```yaml
mockup_violations:
  structural_issues:
    - "HTML doesn't match component hierarchy"
    - "Missing semantic elements"
    - "Accessibility issues (no ARIA)"
    verdict: "REJECT - proper HTML structure required"

  styling_issues:
    - "Inline styles instead of classes"
    - "CSS not matching Figma"
    - "Missing responsive considerations"
    verdict: "REJECT - clean CSS implementation required"

  asset_references:
    - "Broken image paths"
    - "Missing icon references"
    - "Wrong asset filenames"
    verdict: "REJECT - all references must work"
```

---

## Phase 1: File Analysis and Planning

### Task: Analyze Figma File Structure

**DO (Positive Instructions):**
- 本地同步整個 Figma 文件
- 獲取完整樹結構
- 列出所有組件及變體
- 列出所有樣式（顏色、排版、效果）
- 識別頁面/屏幕結構
- 建立提取隊列

**DO NOT (Negative Instructions):**
- 跳過同步（需本地緩存）
- 忽略嵌套組件
- 遺漏變體發現
- 忽視樣式定義
- 未規劃即開始提取

**Verification Criteria:**
```yaml
pass_if:
  - file_synced: true
  - tree_documented: true
  - components_listed: true
  - styles_listed: true
  - extraction_queue_created: true
fail_if:
  - sync_failed: true
  - components_missing: true
  - structure_unclear: true
```

### Plan Adjustment Point 1 (Automatic)
```yaml
checkpoint:
  validate:
    - file_access_working: true
    - components_discoverable: true
    - styles_accessible: true

  auto_adjust:
    large_file: "Split into sections, continue"
    nested_components: "Add to queue, continue"
    missing_styles: "Note gaps, continue"

  stop_only_if:
    critical_blocker: "Cannot access Figma file"

  then: "Proceed immediately to Phase 2"
```

---

## Phase 2: Design Token Extraction

### Task: Extract All Design Tokens

**DO (Positive Instructions):**
- 導出所有顏色樣式
- 導出所有排版樣式
- 導出所有效果樣式（陰影、模糊）
- 導出所有間距/尺寸變量
- 生成 CSS 自定義屬性
- 生成 JSON 令牌文件
- 生成 Tailwind 配置（可選）

**DO NOT (Negative Instructions):**
- 遺漏任何已定義樣式
- 硬編碼值（使用變量）
- 忽略多模式令牌（亮/暗）
- 跳過令牌命名規範
- 令牌不留文檔

**Verification Criteria:**
```yaml
pass_if:
  - all_colors_exported: true
  - all_typography_exported: true
  - all_effects_exported: true
  - css_variables_generated: true
  - json_tokens_generated: true
fail_if:
  - colors_missing: true
  - typography_missing: true
  - values_hardcoded: true
```

### Token Output Structure
```
tokens/
├── tokens.css          # CSS custom properties
├── tokens.json         # Full token data
├── tailwind.config.js  # Tailwind integration
├── colors.css          # Color tokens only
├── typography.css      # Typography tokens only
└── effects.css         # Effect tokens only
```

---

## Phase 3: Component Extraction Loop

隊列中每個組件逐一執行：

### Task: Extract Single Component

**DO (Positive Instructions):**
- 獲取組件線框圖
- 提取所有 CSS 屬性
- 導出組件預覽圖像
- 導出子資產（圖標、圖像）
- 獲取令牌引用
- 生成 HTML 模型
- 創建組件文檔

**DO NOT (Negative Instructions):**
- 跳過任何 CSS 屬性
- 遺漏嵌套元素
- 使用硬編碼值（使用令牌）
- 忽略變體
- 不留文檔

**Per-Component Verification:**
```yaml
pass_if:
  - css_complete: true
  - css_accurate: true
  - assets_exported: true
  - tokens_referenced: true
  - html_mockup_valid: true
  - documentation_complete: true
fail_if:
  - css_missing_properties: true
  - css_values_wrong: true
  - assets_missing: true
  - html_broken: true
```

### Component Output Structure
```
components/ComponentName/
├── README.md           # Documentation
├── component.css       # Extracted CSS
├── variants.css        # Variant-specific CSS
├── tokens.json         # Token usage
├── wireframe.txt       # ASCII structure
├── preview.png         # Component render
├── mockup.html         # HTML implementation
└── assets/
    ├── icon-check.svg
    └── bg-pattern.png
```

### Plan Adjustment Point 3 (Per Component)
```yaml
checkpoint:
  validate:
    - css_extracted: true
    - assets_exported: true
    - docs_generated: true

  auto_adjust:
    missing_child_component: "Add to queue, reference pending"
    variant_discovered: "Add variant to queue"
    token_missing: "Note gap in tokens"

  stop_only_if:
    critical_blocker: "Component completely inaccessible"

  then: "Continue to next component in queue"
```

---

## Phase 4: Page/Screen Extraction Loop

隊列中每個頁面逐一執行：

### Task: Extract Single Page

**DO (Positive Instructions):**
- 獲取頁面結構（章節）
- 提取頁面級佈局 CSS
- 獲取章節線框圖
- 提取章節 CSS
- 導出頁面預覽
- 導出章節預覽
- 記錄組件使用
- 生成頁面 HTML 模型

**DO NOT (Negative Instructions):**
- 跳過佈局/柵格 CSS
- 遺漏章節邊界
- 忽略響應式提示
- 章節不留文檔
- 遺漏組件引用

**Per-Page Verification:**
```yaml
pass_if:
  - layout_extracted: true
  - sections_identified: true
  - section_css_complete: true
  - component_refs_documented: true
  - html_mockup_complete: true
  - documentation_complete: true
fail_if:
  - layout_missing: true
  - sections_incomplete: true
  - component_refs_broken: true
```

### Page Output Structure
```
pages/PageName/
├── README.md           # Page documentation
├── page.css            # Full page CSS
├── layout.css          # Layout/grid CSS
├── preview.png         # Full page render
├── wireframe.txt       # ASCII structure
├── mockup.html         # HTML implementation
├── sections/
│   ├── header/
│   │   ├── section.css
│   │   ├── preview.png
│   │   └── mockup.html
│   ├── hero/
│   └── footer/
└── assets/
```

---

## Phase 5: Library Assembly

### Task: Assemble Complete Library

**DO (Positive Instructions):**
- 創建庫索引/清單
- 生成主 CSS 文件
- 創建組件索引
- 創建頁面索引
- 生成使用文檔
- 創建入門指南

**DO NOT (Negative Instructions):**
- 留下孤立文件
- 遺漏索引條目
- 跳過交叉引用
- 省略設置說明

**Library Output Structure:**
```
design-library/
├── README.md                    # Getting started
├── COMPONENTS.md               # Component index
├── PAGES.md                    # Page index
├── manifest.json               # Library manifest
├── tokens/
│   ├── tokens.css
│   └── tokens.json
├── components/
│   ├── index.css               # All component CSS
│   ├── Button/
│   ├── Card/
│   └── ...
├── pages/
│   ├── index.css               # All page CSS
│   ├── Home/
│   ├── Dashboard/
│   └── ...
└── assets/
    ├── icons/
    └── images/
```

---

## Phase 6: Adversarial Verification

### Task: Full Library Verification

驗證器嘗試攻破庫：

**Verification Checklist:**
```yaml
css_accuracy:
  - compare_every_property_to_figma: true
  - verify_no_hardcoded_values: true
  - check_token_references: true

asset_completeness:
  - all_icons_present: true
  - all_images_present: true
  - correct_formats: true
  - multiple_scales: true

html_validity:
  - html_validates: true
  - css_validates: true
  - no_broken_references: true
  - accessible_markup: true

documentation:
  - all_components_documented: true
  - all_pages_documented: true
  - examples_work: true
  - accurate_to_source: true

structure:
  - follows_template: true
  - no_orphan_files: true
  - manifest_accurate: true
```

### Adversarial Tests
```yaml
adversarial_tests:
  css_comparison:
    - "Overlay HTML on Figma frame"
    - "Pixel-diff visual comparison"
    - "Property-by-property check"

  asset_validation:
    - "All assets referenced exist"
    - "No unreferenced assets"
    - "Correct dimensions"

  html_testing:
    - "Render in browser"
    - "Visual regression test"
    - "Accessibility scan"

  doc_verification:
    - "Code in docs compiles"
    - "Examples are accurate"
    - "No outdated information"
```

---

## Phase 7: Final Delivery

### Task: Package and Deliver

**DO (Positive Instructions):**
- 最終清單生成
- 生成變更摘要
- 創建使用示例
- 打包備發佈

**Deliverables:**
1. 完整設計庫目錄
2. 庫清單（JSON）
3. 入門文檔
4. 組件目錄
5. 頁面目錄
6. 資產清單

---

## Loop Continuation Protocol

Phase 7 完成後：

1. **On Success:**
   - 報告提取摘要
   - 列出所有已提取組件
   - 列出所有已提取頁面
   - 標注所有警告/缺口

2. **On Failure:**
   - 記錄具體失敗點
   - 列出已成功提取內容
   - 識別阻塞問題
   - 建議修復方案

3. **Metrics to Track:**
   - 已提取組件數
   - 已提取頁面數
   - 已導出資產數
   - 已採集 CSS 屬性數
   - 已引用令牌數
   - 發現並修復問題數

---

## Troubleshooting

### 提取中止 / Extraction Stops
- 校驗 Figma 訪問令牌有效
- 核查文件權限（可否在 Figma 中查看？）
- 檢查速率限制（稍候重試）

### 缺少組件 / Missing Components
- 確認組件已在 Figma 中發佈
- 核查組件權限

### CSS 差異 / CSS Differences
- 重跑對抗式驗證（Phase 6）
- 檢查 Figma 不支持特性（如表達式中的變量）

### ⚠️ CRITICAL: Missing tokens.css
**Problem:** HTML 引用 `var(--color-primary)` 但 `tokens/tokens.css` 不存在
**Cause:** Phase 2（令牌導出）被跳過或失敗
**Fix:**
```bash
figma-query export_tokens \
  file_key="YOUR_FILE_KEY" \
  output_path="./tokens/tokens.css" \
  format="css"
```
**Prevention:** 勿跳階段，逐階段驗證。

### ⚠️ CRITICAL: Empty assets/ Directory
**Problem:** HTML 引用 `<img src="../assets/logo.svg">` 但 assets/ 為空
**Cause:** Phase 3/4（資產導出）被跳過或失敗
**Fix:**
```bash
# 1. 先搜資產
figma-query search file_key="YOUR_FILE_KEY" pattern="*logo*"
# 2. 再導出
figma-query export_assets \
  file_key="YOUR_FILE_KEY" \
  node_ids=["NODE_ID_1", "NODE_ID_2"] \
  output_dir="./assets" \
  formats=["svg", "png"]
```

### Verify Extraction Complete
提取後核查關鍵文件存在：
```bash
ls -lh design-library/tokens/tokens.css     # 令牌
ls -lh design-library/components/            # 至少 1 組件
ls -lh design-library/assets/                # 至少 1 資產
ls -lh design-library/README.md              # 文檔
```

### Incomplete Extraction — Resume
若提取中途停止，從檢查點恢復：
```bash
cat design-library/.extraction-state.json    # 查提取狀態
# 從上次檢查點續跑循環
```
