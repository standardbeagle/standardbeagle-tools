---
name: design-utilities-recommender
description: "Routes design-utilities intent to right manual skill among color, typography, design-token, image, a11y helpers — sole auto gateway; others manual. design-utilities 唯一自動網關。 Use when: color/contrast/palette, typography/font/type scale, design tokens, image optimize/responsive/blurhash, static a11y/WCAG audit, unsure which design-utilities skill."
---

# design-utilities Skill Recommender

此為 design-utilities 諸技藝之唯一**自動**網關。餘皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一，避免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝只路由，不執行 MCP 調用。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 五域各具 **overview**（工具全覽）與 **quick-start**（工具速查）二技藝：初探該域 → overview；已知欲呼工具、求參數速查 → quick-start。
3. 告知：「宜用 `design-utilities:<skill>`」並以 `Skill` 工具調之（或提示 `/<skill>`）。
4. 意圖跨多域則列首選 + 次選，勿全羅列。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 顏色域概覽（對比/色盲/調色/色空間/和諧） | `design-utilities:color-overview` |
| 顏色工具速查（contrast_check, color_blindness_simulate, palette_extract, color_convert, harmony_generate） | `design-utilities:color-quick-start` |
| 排版域概覽（模數比例/字體度量/可變軸/子集化/後備棧） | `design-utilities:typography-overview` |
| 排版工具速查（modular_scale, font_metrics, variable_font_axes, font_subset, font_stack） | `design-utilities:typography-quick-start` |
| 設計 token 域概覽（生成/導出/校驗/diff/合併主題） | `design-utilities:design-token-overview` |
| 設計 token 工具速查（tokens_generate, tokens_export, tokens_validate, tokens_diff, tokens_merge, tailwind_generate） | `design-utilities:design-token-quick-start` |
| 圖像處理域概覽（優化/格式轉換/響應式/BlurHash/SVG） | `design-utilities:image-processing-overview` |
| 圖像工具速查（image_optimize, responsive_generate, blur_hash, svg_optimize, palette_from_image） | `design-utilities:image-processing-quick-start` |
| 靜態無障礙審計域概覽（HTML/WCAG/標題/ARIA/連結/PDF，無瀏覽器） | `design-utilities:a11y-audit-overview` |
| a11y 工具速查（audit_html, wcag_score, heading_structure, aria_validate, link_text_check, document_accessibility） | `design-utilities:a11y-audit-quick-start` |

## Disambiguation

- **overview vs quick-start**（每域皆有此抉擇）：初探該域、欲知有何工具及能為 → `*-overview`；已知欲呼哪工具、只求參數與調用速查 → `*-quick-start`。
- **調色板提取**跨二域：由圖像抽主色 → `design-utilities:image-processing-quick-start`（palette_from_image）；由色值生成和諧配色 → `design-utilities:color-quick-start`（harmony_generate / palette_extract）。
- **無障礙**：靜態源碼/HTML/PDF 之 WCAG 審計（無瀏覽器）→ `design-utilities:a11y-audit-*`；色彩對比之驗證 → `design-utilities:color-*`（contrast_check）。

## Related

- `design-utilities:color-overview` / `design-utilities:typography-overview` / `design-utilities:design-token-overview` / `design-utilities:image-processing-overview` / `design-utilities:a11y-audit-overview` — 五域各自之工具全覽入口。
