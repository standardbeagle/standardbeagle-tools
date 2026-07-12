---
name: prompt-engineer-recommender
description: "Routes prompt-engineering intent to right manual prompt-engineer skill — sole auto gateway; others manual. 唯一自動網關。 Use when: write/analyze/optimize/evaluate prompt, system prompt, chain-of-thought or reasoning design, few-shot examples, RAG or multi-agent prompts, Claude/model-specific tuning, context engineering/audit/compression, prompt injection defense, unsure which prompt-engineer skill."
---

# prompt-engineer Skill Recommender

此為 prompt-engineer 十七技藝之唯一**自動**網關。餘皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一，避免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝只路由，不執行提示工程。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「此屬 X，宜用 `prompt-engineer:<skill>` 技藝」並以 `Skill` 工具調之（或提示 `/<skill>`）。
3. 意圖跨多行則列首選 + 次選，勿全羅列。
4. 意圖含混、近義技藝相爭 → 見 Disambiguation。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 從零創建系統提示 | `prompt-engineer:create-system-prompt` |
| 分析既有提示之清晰度/問題 | `prompt-engineer:analyze-prompt` |
| 改善既有提示（準確/一致/創意/速度/安全） | `prompt-engineer:optimize-prompt`（見 Disambiguation） |
| 程序化/評估驅動自動優化（DSPy/OPRO） | `prompt-engineer:automatic-optimization`（見 Disambiguation） |
| 以指標與測試案例評估提示效果 | `prompt-engineer:eval-prompt`（見 Disambiguation） |
| 思維鏈/推理技術（CoT/ToT/ReAct） | `prompt-engineer:chain-of-thought` |
| 少樣本示例設計（DICE 框架） | `prompt-engineer:few-shot-design` |
| 提示工程模式與技術全覽參考 | `prompt-engineer:prompt-patterns` |
| Claude 專屬優化（Opus/Sonnet/Haiku） | `prompt-engineer:claude-optimization` |
| 其他 LLM 之模型專屬指引 | `prompt-engineer:model-specific` |
| 多代理系統提示設計與編排 | `prompt-engineer:multi-agent-prompts` |
| RAG 專屬提示工程 | `prompt-engineer:rag-prompting` |
| 語境工程原理與架構設計 | `prompt-engineer:context-engineering` |
| 審計語境視窗使用/診斷 context rot | `prompt-engineer:context-audit` |
| 壓縮語境以適應 token 限制 | `prompt-engineer:compress-context` |
| 防禦提示架構/注入防護/安全護欄（原理參考） | `prompt-engineer:prompt-scaffolding`（見 Disambiguation） |
| 動手創建防禦架構/注入加固之提示 | `prompt-engineer:scaffold-prompt`（見 Disambiguation） |

## Disambiguation

近義技藝抉擇：

- **防禦架構**：`prompt-engineer:prompt-scaffolding` 與 `prompt-engineer:scaffold-prompt` 同宗 — 皆防注入、加安全護欄。`prompt-scaffolding` 為原理與模式參考；`scaffold-prompt` 為動手創建流程。擇其一，勿並用。
- **優化**：手動應用技術改善單一提示 → `prompt-engineer:optimize-prompt`；程序化迭代、定指標、跑 A/B 或回歸 → `prompt-engineer:automatic-optimization`。
- **優化 vs 評估**：改提示 → `optimize-prompt` / `automatic-optimization`；量度提示質量、前後對比、建回歸套件 → `prompt-engineer:eval-prompt`。
- **模式**：泛覽策略選型 → `prompt-engineer:prompt-patterns`；專攻推理鏈 → `prompt-engineer:chain-of-thought`。
- **模式 vs 少樣本**：泛覽全部模式索引 → `prompt-engineer:prompt-patterns`；深攻示例設計（DICE） → `prompt-engineer:few-shot-design`。
- **語境三技**：設計架構/token 預算 → `context-engineering`；審計既有用量/診斷 bloat → `context-audit`；實際壓縮以適 window → `compress-context`。
- **模型專屬**：目標 Claude → `claude-optimization`；其他 LLM 家族 → `model-specific`。

## Related

- `prompt-engineer:prompt-patterns` — 策略選型之總覽索引。
- `prompt-engineer:context-engineering` — 語境架構之上位原理。
