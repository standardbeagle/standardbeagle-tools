---
name: figma-query-validate-extraction
description: "Validate a Figma design library extraction for completeness and correctness. 驗證 Figma 設計庫提取的完整性與正確性。 Use when: after completing an extraction, checking for broken references, validating tokens.css exists, verifying assets are present, confirming HTML examples work"
disable-model-invocation: true
---

# Validate Design Library Extraction

驗證提取的設計庫，確保所有必要文件、令牌、資產與文檔齊備且正確鏈接。

## Prerequisites

- 已提取的設計庫目錄
- 原始 Figma 文件 key（用於對比）

## Validation Checklist

### 1. Directory Structure
```
✓ tokens/ directory exists
✓ tokens/tokens.css exists (CSS custom properties)
✓ components/ directory exists
✓ components/css/ directory exists
✓ assets/ directory exists (not empty)
✓ examples/ directory exists
✓ README.md exists
```

### 2. Design Tokens
```
✓ tokens.css contains --color-* variables
✓ tokens.css contains --font-* variables
✓ tokens.css contains --spacing-* variables
✓ All CSS variables are defined (no undefined vars)
```

### 3. Component CSS
```
✓ At least one CSS file in components/css/
✓ CSS files use tokens (var(--...)) not hardcoded values
✓ CSS follows BEM naming convention
✓ No broken @import statements
```

### 4. Assets
```
✓ assets/ directory is not empty
✓ All image references in HTML exist
✓ SVG files are valid XML
✓ PNG files have correct dimensions
```

### 5. HTML Examples
```
✓ All CSS references resolve (files exist)
✓ All asset references resolve (files exist)
✓ HTML is valid (no unclosed tags)
✓ CSS variables used in HTML are defined
```

### 6. Documentation
```
✓ README.md has getting started instructions
✓ Component index lists all components
✓ Examples demonstrate actual extracted components
```

## Usage

### Basic Validation
```
Run this skill and provide:
- output_dir: Path to the extracted library
- file_key: Original Figma file key
```

### What Gets Checked

**File Existence:**
- 所有預期目錄
- 必要 CSS 文件
- 資產文件
- 文檔文件

**Content Validation:**
- CSS 語法有效
- 變量先定義後使用
- HTML 引用存在
- 鏈接未斷開

**Completeness:**
- 所有組件均有 CSS
- 所有引用資產存在
- 令牌覆蓋率充足

## Validation Process

1. **Check Directory Structure**：驗證所有預期目錄存在，統計各目錄文件數

2. **Validate Design Tokens**：解析 tokens.css，提取所有 CSS 自定義屬性，核查常見令牌類別（顏色、字體、間距）

3. **Validate Component CSS**：解析所有 CSS 文件，核查令牌用法（`var(...)`），驗證 CSS 語法，標注硬編碼值（警告）

4. **Validate Assets**：列出所有資產，核查文件格式（圖標用 SVG，圖像用 PNG），驗證文件大小（過大則警告）

5. **Validate HTML Examples**：解析 HTML 文件，提取 CSS href 引用，提取資產 src 引用，驗證所有引用存在

6. **Validate Documentation**：確認 README 存在且有內容，核查組件索引存在，統計已文檔化與已提取組件數

## Output Format

### Success Case
```
✓ VALIDATION PASSED

Directory Structure: ✓ All present
Design Tokens: ✓ 156 tokens defined
Component CSS: ✓ 3 files, 1,335 lines
Assets: ✓ 45 files (23 SVG, 22 PNG)
HTML Examples: ✓ 2 files, all references valid
Documentation: ✓ Complete

No issues found.
```

### Failure Case
```
✗ VALIDATION FAILED

Directory Structure: ✓ All present
Design Tokens: ✗ MISSING tokens.css
Component CSS: ⚠ WARNING - hardcoded colors found
Assets: ✗ EMPTY - no assets exported
HTML Examples: ✗ BROKEN - 3 missing CSS files
Documentation: ✓ Complete

Critical Issues (2):
1. tokens/tokens.css not found
   Fix: Run export_tokens with file_key="{FILE_KEY}"

2. assets/ directory is empty
   Fix: Run export_assets to extract icons and images

Warnings (1):
1. Hardcoded color values in components/css/buttons.css
   Suggestion: Use design tokens instead (var(--color-...))
```

## Auto-Fix Mode

發現問題時，驗證可提供精確修復命令：

```bash
# Missing tokens.css
figma-query export_tokens file_key="FILE_KEY" output_path="./tokens/tokens.css" format="css"

# Empty assets directory
# First, search for assets
figma-query search file_key="FILE_KEY" pattern="*" node_types=["COMPONENT"]

# Then export found assets
figma-query export_assets file_key="FILE_KEY" node_ids=["..."] output_dir="./assets"
```

## Integration with Extract-Library

驗證應在 `/extract-library` 末尾自動運行：

1. **提取期間**：每階段後的检查點驗證
2. **提取完成後**：聲明完成前的全量驗證
3. **失敗時**：提供具體修復命令

> Invoke the `Skill` tool with `skill: figma-query:complete-extraction` — 執行含最終驗證的完整提取工作流。

## Validation Rules Reference

### Critical Errors (Must Fix)
- 缺少 tokens.css
- 缺少必要目錄
- HTML/CSS 引用斷開
- CSS 語法無效
- assets 目錄為空且 HTML 引用了圖像

### Warnings (Should Fix)
- 使用硬編碼值而非令牌
- 文件過大（> 1MB）
- 文檔章節缺失
- 組件覆蓋不完整

### Info (Nice to Have)
- 更多令牌類別
- 更多 HTML 示例
- 更詳細文檔

## Example Workflow

```
# After extraction
/validate-extraction output_dir="./docs" file_key="lnwVxZrQ6pqvArfEr1EiXt"

# If validation fails, follow the fix commands provided

# Re-validate
/validate-extraction output_dir="./docs" file_key="lnwVxZrQ6pqvArfEr1EiXt"

# Success!
```

## Advanced Validation

### Compare with Figma Source
```
figma-query diff local_path="./docs" file_key="FILE_KEY"
```

核查：
- 組件數與 Figma 匹配
- 樣式數與 Figma 匹配
- 資產數與 Figma 匹配
- CSS 準確性對照 Figma 值
