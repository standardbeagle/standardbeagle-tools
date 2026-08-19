---
name: dev-standards-ultra-clean
description: "Evidence-first eight-lane codebase cleanup: dedupe, shared types, unused code, cycles, weak types, defensive catches, legacy/fallback paths, comment slop. 八道證據先行之清碼。 Use when: clean up the repo, remove unused code, untangle circular deps, replace any/unknown, strip fallbacks, delete legacy paths, remove AI slop comments, tech-debt sweep. Skip: product changes, single-file tidy."
disable-model-invocation: true
---

# Ultra Clean

廣泛之清碼請求 → 有紀律之稽核 + 實施。序：證據 → 刪除 → 抽象。行為不變之重構，非產品改動。

## Core Rules

- 未編先建基線：結構、語言、包管、驗證命令、生成碼、框架入口、公共接口。
- 八道（lanes）並行；並發受限則分波，道界不變。每道必出：批判評估、具體證據、建議集、已實施之高信改動、驗證註。
- **唯高信者實施**；中信記錄不動。刪除勝抽象，簡化勝巧思。
- 刪除與合併不可憑單一信號：工具輸出 × 代碼搜索 × 運行入口 × 測試 × 公共 API 面交叉證之。
- 不回滾無關用戶改動；就現樹而作。
- 本倉之例：no fallbacks（lane 6/7 直承 AGENTS.md「NO FALLBACKS」「Replace and remove」）；測試/構建皆經 `tman`；每道一逻辑 commit（refactor 型），見 worktrack-loop:git-commit-discipline。

## Baseline

道啟前：映射倉（略生成/vendored/編譯/鏡像）；定驗證命令（tests、lint、typecheck、build、框架檢查）；標反射/非顯入口（Next.js routes/loaders、CLI 注冊表、DI 容器、插件系、字串 import、序列化器/遷移/RPC/任務執行器）；標高危邊界（公共 API、持久化 schema、網絡 I/O、authn/authz、錯誤邊界、跨包契約）。工具輸出乃線索非判決。

工具：repo 原生優先；`knip`（未用）、`madge`（循環）、`tsc --noEmit` 或同類；`lci` 可用則 `lci:search-code` / `lci:trace-symbol` 查全調用者。

## Lanes

全則見 [LANES.md](LANES.md)。默認序（倉有更佳則從之）：

| # | Lane | 要旨 |
|---|---|---|
| 4 | circular deps | 最小後邊；type-only import、下移中性邏輯、拆 barrel |
| 2 | shared types | 一概念一權威定義；所有權明，非「皆入 shared」 |
| 5 | strong types | `any`/`unknown`→真契約；`unknown` 僅邊界且即窄化 |
| 1 | dedupe | 同契約方合；行為同非文本似 |
| 3 | unused code | 「未 import」≠「未用」；config/反射/框架/外部消費者皆查 |
| 7 | legacy & fallback | 定準路徑，整枝刪盡；遷移/灰度態須證 |
| 6 | defensive catches | 唯錯誤所有權真處 catch；去吞錯、去默認值、去「以防萬一」 |
| 8 | comment slop | 去復述、陳舊、無主 TODO、AI 腔；留不可見之不變量 |

序之理：循環扭曲 import 邊界，先解；共享類型定則強型與去重有據；未用與遺留重疊甚，協而不重；注釋最後，映終碼。

## Subagent Guidance

一子代理一道一範圍；索證據非意見；寫域不相交；兩道衝突則先於本地定契約再落編。以 Wenyan 簡令。

## Evidence Standard

高信需全備：代碼搜索證用法形；相關處有工具輸出；入口與運行注冊已查；有測試/型覆蓋或直接驗證路；改動簡化而不默擴行為。缺一則留於報告，不實施。

## Deliverables & Validation

每道：批判評估 → 建議（高/中/低信）→ 已實施之高信改 → 驗證摘要（所跑命令、餘隙）。格式：

```markdown
## Critical Assessment
- What is wrong now / Why it matters / Confidence
## Recommendations
- High (implement now) / Medium (missing evidence) / Low (needs design or product input)
## Implementation
- Files or areas changed / removed, consolidated, strengthened / intentionally left untouched
## Validation
- Commands run / passed / not run / residual risk
```

驗證二級：每道或批後局部（定向測試、typecheck、lint、聚焦運行檢查）；整合後全倉。驗證不全則勿稱「clean」——明言何已驗何未驗。

## Related

- Pre-code gate：Invoke the `Skill` tool with `skill: dev-standards:ponytail` — 未寫之碼無需清。
- Ledger：Invoke the `Skill` tool with `skill: dev-standards:ponytail-debt` — `ponytail:` 捷徑成熟者入 lane 6/7。
- Design-time：Invoke the `Skill` tool with `skill: dev-standards:refactor-first-assessment` — 規劃期以 lane 2/4/5/7 探觸點。

> Adapted from [theclaymethod/ultra-clean-skill](https://github.com/theclaymethod/ultra-clean-skill). Lane set and evidence standard kept; house rules (no fallbacks, tman, lci, atomic commits) added.
