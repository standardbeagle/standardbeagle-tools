---
name: validate-extraction
description: Validate a Figma design library extraction for completeness and correctness
---

# Validate Design Library Extraction

Validates an extracted design library to ensure all required files, tokens, assets, and documentation are present and correctly linked.

## Prerequisites

- Extracted design library directory
- Original Figma file key (for comparison)

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
- All expected directories
- Required CSS files
- Asset files
- Documentation files

**Content Validation:**
- CSS syntax is valid
- Variables are defined before use
- HTML references exist
- Links are not broken

**Completeness:**
- All components have CSS
- All referenced assets exist
- Token coverage is adequate

## Validation Process

1. **Check Directory Structure**
   - Verify all expected directories exist
   - Count files in each directory

2. **Validate Design Tokens**
   - Parse tokens.css
   - Extract all CSS custom properties
   - Check for common token categories (color, font, spacing)

3. **Validate Component CSS**
   - Parse all CSS files
   - Check for token usage (var(...))
   - Validate CSS syntax
   - Check for hardcoded values (warn)

4. **Validate Assets**
   - List all assets
   - Check file formats (SVG for icons, PNG for images)
   - Validate file sizes (warn if too large)

5. **Validate HTML Examples**
   - Parse HTML files
   - Extract CSS href references
   - Extract asset src references
   - Verify all references exist

6. **Validate Documentation**
   - Check README exists and has content
   - Verify component index exists
   - Count documented vs extracted components

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

When issues are found, the validation can provide exact fix commands:

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

This validation should run automatically at the end of `/extract-library`:

1. **During extraction**: Checkpoint validation after each phase
2. **After extraction**: Full validation before completion
3. **On failure**: Provide specific fix commands

## Validation Rules Reference

### Critical Errors (Must Fix)
- Missing tokens.css
- Missing required directories
- Broken HTML/CSS references
- Invalid CSS syntax
- Empty assets directory when HTML references images

### Warnings (Should Fix)
- Hardcoded values instead of tokens
- Large file sizes (> 1MB)
- Missing documentation sections
- Incomplete component coverage

### Info (Nice to Have)
- Additional token categories
- More HTML examples
- Extended documentation

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

This checks:
- Component count matches Figma
- Style count matches Figma
- Asset count matches Figma
- CSS accuracy against Figma values
