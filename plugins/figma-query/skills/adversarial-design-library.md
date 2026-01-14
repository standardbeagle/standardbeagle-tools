---
name: adversarial-design-library
description: Adversarial cooperation loop for creating a complete design library from Figma with CSS, assets, HTML mockups, and documentation
---

# Adversarial Design Library Loop (Ralph Wiggum Pattern)

A continuous execution loop where an extractor and verifier cooperate adversarially to create a production-ready design library from Figma. The verifier actively challenges every extraction while the extractor defends and improves.

## Mission

Extract a complete, production-ready design library with:
- **Exact Figma CSS** - Pixel-perfect style extraction
- **Original Assets** - All images, icons, and graphics
- **HTML Mockups** - Implementation-ready HTML/CSS
- **Comprehensive Documentation** - Component, page, and section docs

## Core Principles

### Context-Sized Extraction
Each extraction task must be:
- **Bounded**: Single component or section at a time
- **Measurable**: Clear output artifacts
- **Verifiable**: Can be checked against Figma
- **Isolated**: No dependencies on unextracted elements

### Plan Adjustment Protocol
At the end of EACH phase, **automatically**:
1. Review what was extracted
2. Update remaining items based on discoveries
3. Re-prioritize if issues found
4. Document adjustments
5. **Continue immediately** to next phase unless BLOCKED

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

The verifier must be **ruthlessly vigilant** for these violations.

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
- Sync entire Figma file locally
- Get complete tree structure
- List all components with variants
- List all styles (colors, typography, effects)
- Identify page/screen structure
- Create extraction queue

**DO NOT (Negative Instructions):**
- Skip syncing (need local cache)
- Ignore nested components
- Miss variant discovery
- Overlook style definitions
- Start extracting without plan

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
- Export all color styles
- Export all typography styles
- Export all effect styles (shadows, blur)
- Export all spacing/sizing variables
- Generate CSS custom properties
- Generate JSON token file
- Generate Tailwind config (optional)

**DO NOT (Negative Instructions):**
- Miss any defined styles
- Hardcode values (use variables)
- Ignore multi-mode tokens (light/dark)
- Skip token naming conventions
- Leave tokens undocumented

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

For EACH component in the queue:

### Task: Extract Single Component

**DO (Positive Instructions):**
- Get component wireframe
- Extract all CSS properties
- Export component preview image
- Export child assets (icons, images)
- Get token references
- Generate HTML mockup
- Create component documentation

**DO NOT (Negative Instructions):**
- Skip any CSS property
- Miss nested elements
- Use hardcoded values (use tokens)
- Ignore variants
- Leave undocumented

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

For EACH page in the queue:

### Task: Extract Single Page

**DO (Positive Instructions):**
- Get page structure (sections)
- Extract page-level layout CSS
- Get section wireframes
- Extract section CSS
- Export page preview
- Export section previews
- Document component usage
- Generate page HTML mockup

**DO NOT (Negative Instructions):**
- Skip layout/grid CSS
- Miss section boundaries
- Ignore responsive hints
- Leave sections undocumented
- Miss component references

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
- Create library index/manifest
- Generate master CSS file
- Create component index
- Create page index
- Generate usage documentation
- Create getting started guide

**DO NOT (Negative Instructions):**
- Leave orphan files
- Miss index entries
- Skip cross-references
- Omit setup instructions

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

The verifier attempts to break the library:

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
- Final manifest generation
- Generate change summary
- Create usage examples
- Package for distribution

**Deliverables:**
1. Complete design library folder
2. Library manifest (JSON)
3. Getting started documentation
4. Component catalog
5. Page catalog
6. Asset inventory

---

## Loop Continuation Protocol

After Phase 7:

1. **On Success:**
   - Report extraction summary
   - List all components extracted
   - List all pages extracted
   - Note any warnings/gaps

2. **On Failure:**
   - Document specific failure point
   - List what was successfully extracted
   - Identify blocking issues
   - Recommend remediation

3. **Metrics to Track:**
   - Components extracted
   - Pages extracted
   - Assets exported
   - CSS properties captured
   - Tokens referenced
   - Issues found and fixed
