---
name: extract-library
description: "Extract complete design library from Figma with CSS, assets, HTML mockups, and documentation using adversarial quality verification. 對抗式全量提取設計庫：CSS、資產、HTML、文檔。 Use when: extracting full design library, building complete component system, running adversarial extraction loop, generating production-ready design artifacts, full figma-to-code pipeline"
arguments:
  - name: file_key
    description: "Figma file key (from URL)"
    required: true
  - name: output_dir
    description: "Output directory (default: ./design-library)"
    required: false
---

# Extract Design Library

以對抗式提取循環從 Figma 文件生成生產就緒設計庫。

## What This Creates

完整設計庫含：
- **Exact Figma CSS** - 像素精確樣式提取
- **Original Assets** - 全部圖標、圖像、圖形
- **HTML Mockups** - 可實施 HTML/CSS
- **Design Tokens** - CSS 變量、JSON、Tailwind 配置
- **Documentation** - 組件與頁面文檔

## Usage

```
/extract-library <file_key> [output_dir]
```

## Getting the File Key

From a Figma URL:
```
https://www.figma.com/design/ABC123xyz/My-Design-System
                            ^^^^^^^^^^^
                            This is the file_key
```

## Extraction Process

本命令使用 **complete-extraction** 技能執行已驗證、依賴感知的提取流程：

### Phase 0: Pre-Flight Check ⚠️

**CRITICAL:** 啟動前驗證前置條件
- 校驗 Figma 訪問（令牌、API、權限）
- 確認文件含組件/樣式
- 核查輸出目錄可寫
- 估算提取時間與體積

> Invoke the `Skill` tool with `skill: figma-query:preflight-check` — 驗證 Figma 訪問、文件內容及輸出目錄。

### Phase 1: Sync File

- 下載完整 Figma 文件結構至本地
- 創建含所有節點的 `figma-export/` 目錄
- 提取元數據、組件與樣式

### Phase 2: Export Design Tokens ⚠️ CRITICAL

**CRITICAL:** HTML 示例依賴 tokens.css 存在
- 導出含 CSS 自定義屬性的 `tokens/tokens.css`
- 導出 `tokens/tokens.json`（可選）
- 導出 `tokens/tailwind.tokens.js`（可選）

**缺少此階段：** HTML 將含未定義 CSS 變量。

### Phase 3: Component CSS Extraction

每類組件：
- 提取精確 Figma CSS
- 保存至分類文件（buttons.css、cards.css 等）
- 使用設計令牌（非硬編碼值）
- 遵循 BEM 命名規範

### Phase 4: Asset Export ⚠️ CRITICAL

**CRITICAL:** HTML 示例引用這些資產
- 搜索所有可導出資產（圖標、圖像、Logo）
- 矢量/圖標導出 SVG
- 圖像導出 PNG（1x、2x）
- 保存至 `assets/` 目錄

**缺少此階段：** HTML 將含斷裂圖片鏈接。

### Phase 5: HTML Example Generation

**依賴：** 第 2、3、4 階段須先完成
- 創建組件展示 HTML
- 創建頁面示例 HTML
- 鏈接 tokens.css 及組件 CSS
- 引用已導出資產
- 驗證所有鏈接可解析

### Phase 6: Documentation Generation

- 創建含入門指南的主 README
- 創建組件索引
- 文檔化設計令牌
- 文檔化使用示例

### Phase 7: Final Validation ⚠️

**CRITICAL:** 驗證提取完整且準確
- 校驗目錄結構
- 確認 tokens.css 存在且有效
- 核查 assets 目錄已填充
- 檢查 HTML 無斷裂鏈接
- 確保文檔完整

> Invoke the `Skill` tool with `skill: figma-query:validate-extraction` — 驗證完整庫，自動修復常見問題。

**自動修復：** 驗證失敗時自動修復常見問題。

## Output Structure

```
design-library/
├── README.md                    # Getting started guide
├── COMPONENTS.md               # Component index
├── PAGES.md                    # Page index
├── manifest.json               # Library manifest
├── index.css                   # Master CSS import
│
├── tokens/
│   ├── tokens.css              # CSS custom properties
│   ├── tokens.json             # JSON format
│   └── tailwind.config.js      # Tailwind integration
│
├── components/
│   ├── index.css               # All component CSS
│   ├── Button/
│   │   ├── README.md           # Component docs
│   │   ├── component.css       # Extracted CSS
│   │   ├── tokens.json         # Token usage
│   │   ├── wireframe.txt       # Structure
│   │   ├── preview.png         # Visual preview
│   │   ├── mockup.html         # HTML implementation
│   │   └── assets/             # Component assets
│   ├── Card/
│   └── ...
│
├── pages/
│   ├── index.css               # All page CSS
│   ├── Home/
│   │   ├── README.md           # Page docs
│   │   ├── page.css            # Page CSS
│   │   ├── layout.css          # Layout CSS
│   │   ├── preview.png         # Page preview
│   │   ├── mockup.html         # HTML mockup
│   │   └── sections/           # Section details
│   └── ...
│
└── assets/
    ├── icons/                  # All exported icons
    └── images/                 # All exported images
```

## Quality Guarantees

對抗式循環確保：

### CSS Accuracy
- 每個 Figma 屬性均提取
- 值完全匹配
- 使用設計令牌（無硬編碼值）

### Asset Completeness
- 所有圖標已導出（SVG）
- 所有圖像已導出（PNG，多倍率）
- 無斷裂引用

### Documentation
- 每個組件有文檔
- 每個頁面有文檔
- 含可用示例

### HTML Mockups
- 語義化 HTML 結構
- BEM 命名規範
- 無障礙標記
- 無行內樣式

## Example Output

提取後：

```
Extraction Summary
==================
File: ABC123xyz
Components: 45 extracted
Pages: 12 extracted
Tokens: 156 exported
Assets: 234 exported
Issues Found: 3
Issues Fixed: 3
Warnings: 2

Output: ./design-library/
```

## Using the Library

### Import CSS
```html
<link rel="stylesheet" href="./design-library/index.css">
```

### Use Tokens
```css
.my-button {
  background: var(--color-primary-500);
  padding: var(--spacing-4);
}
```

### Copy Components
開任意 `mockup.html` 可查看可實施 HTML。

## Troubleshooting

### Extraction Stops
- 校驗 Figma 訪問令牌有效
- 核查文件權限（可否在 Figma 中查看？）
- 檢查速率限制（稍候重試）

### Missing Components
- 確認組件已在 Figma 中發佈
- 核查組件權限

### CSS Differences
- 重新執行對抗式驗證
- 檢查 Figma 不支持的特性（如表達式中的變量）

### ⚠️ CRITICAL: Missing tokens.css
**Problem:** HTML files reference `var(--color-primary)` but `tokens/tokens.css` doesn't exist

**Cause:** Phase 2 (token export) was skipped or failed

**Fix:**
```bash
# Export tokens manually
figma-query export_tokens \
  file_key="YOUR_FILE_KEY" \
  output_path="./docs/tokens/tokens.css" \
  format="css"
```

**Prevention:** Always run complete extraction workflow, don't skip phases

### ⚠️ CRITICAL: Empty assets/ Directory
**Problem:** HTML files reference `<img src="../assets/logo.svg">` but assets/ is empty

**Cause:** Phase 4 (asset export) was skipped or failed

**Fix:**
```bash
# First, find assets to export
figma-query search \
  file_key="YOUR_FILE_KEY" \
  pattern="*logo*"

# Then export them
figma-query export_assets \
  file_key="YOUR_FILE_KEY" \
  node_ids=["NODE_ID_1", "NODE_ID_2"] \
  output_dir="./docs/assets" \
  formats=["svg", "png"]
```

**Prevention:** Always run complete extraction workflow, validate after each phase

### HTML Examples Have Broken Links

**問題：** 打開 HTML 顯示缺少 CSS 或圖像。

**原因：** 各階段完成順序有誤或不完整。

**Fix:**
```bash
# Run validation to see what's missing
Use validate-extraction skill with:
  output_dir: "./docs"
  file_key: "YOUR_FILE_KEY"

# It will provide specific fix commands for each issue
```

### How to Verify Extraction is Complete

提取後核查以下文件存在：
```bash
# Critical files that MUST exist:
docs/tokens/tokens.css           # Design tokens
docs/components/css/*.css         # At least 1 CSS file
docs/assets/*                     # At least 1 asset file
docs/examples/*.html              # At least 1 HTML file
docs/README.md                    # Documentation

# Validation command:
ls -lh docs/tokens/tokens.css
ls -lh docs/components/css/
ls -lh docs/assets/
ls -lh docs/examples/
```

### Incomplete Extraction - How to Resume

若提取中途停止：
```bash
# Check extraction state
cat docs/.extraction-state.json

# Resume from last checkpoint
/extract-library --resume-from="./docs/.extraction-state.json"
```

## Next Steps

提取後：
1. 查閱輸出目錄中的 `README.md`
2. 瀏覽 `COMPONENTS.md` 盤點組件
3. 從模型複製 HTML 至代碼庫
4. 導入 `index.css` 獲取所有樣式
