---
name: ideation-recommender
description: "Recognises idea-generation intent and PROPOSES ideation before running it — sole auto gateway; ideate itself stays manual. ideation 唯一自動網關，先薦後行。 Use when: 'give me ideas', 'what should I improve', 'ideate on X', 'surprise me', 'what would you change', 'brainstorm', asking for options or a ranked idea report. Skip: clear bug with repro, mechanical refactor, complete spec ready to implement."
---

# ideation Skill Recommender

此為 ideation 之唯一**自動**網關。`ideation:ideate` 為手動（`disable-model-invocation: true`）。

> 職責：**判意圖 → 呈提案 → 待用戶允 → 方載 ideate**。
> **本技藝之要義在「先薦後行」。未得明允，不得逕載 `ideate`。**

## 何以必先薦（why proposing is the whole point）

`ideate` 非輕量問答：其掃碼庫、並行 dispatch 子代理生成、逐一對抗批判、再收斂為產物，耗時耗 token。用戶索「一些想法」時，所欲者多為**一段直答**，非一場工作流。未薦而逕行，是以重器應輕問 — 此即本網關存在之由。

反之，用戶若確欲廣探選項，`ideate` 遠勝即席羅列：其有紮根、有拒理由、有排序、有產物。故不可因其重而諱言之。

**準則：薦之，勿代決。**

## Flow

1. **辨意圖**。合下列 Skip 之任一 → 不薦，直接做事。
2. **先給直答**。若一段話即可回答者，先答之；再以一句提出 ideation 為可選之深探。勿以提案取代答案。
3. **呈提案**（見下 Proposal shape），用平台阻塞式提問工具（Claude Code `AskUserQuestion`、Codex `request_user_input`、Gemini `ask_user`）；無此工具則於聊天中列編號選項並候覆。
4. **得允** → 讀 `ideate` 之 SKILL.md 而載之（見 Loading），以用戶所擇之焦點與產物型別為 `$ARGUMENTS`。
5. **得拒** → 依所擇之替代逕行，勿再薦。

## Proposal shape

提案須具體，勿泛言「要不要腦暴一下」。一次說清四事：

- **將做什麼** — 掃何處之碼、生幾許構想、如何批判收斂。
- **將得何物** — 排序構想、HTML 報告、原則、決策樹、或實作計劃草案（令用戶擇其一）。
- **代價** — 較直答為慢，並行子代理耗 token。
- **替代** — 「我直接答」「先出一版計劃」「只列三條原則」。

薦時附己見（宜用何者、何故），令用戶一擇即定。**勿滴問** — 諸獨立之 blocking 問題一次批出。

## Skip（不薦，逕行）

| 情形 | 應為 |
|---|---|
| 有 repro 之明確 bug | 逕修；或 `dev-standards:diagnose` |
| 機械重構、改名、格式 | 逕改 |
| 規格完整之實作 | 逕實作；大者交 `/worktrack:plan` |
| 用戶已擇定方向，僅問如何做 | 逕答 |
| 用戶已明言「不要腦暴 / 直接說」 | 逕答，並勿再薦 |

## Loading a routed skill (載法)

`ideate` 設 `disable-model-invocation: true` — 故**不可**以 `Skill` 工具喚之。讀其檔即載其令：

1. Read `${CLAUDE_PLUGIN_ROOT}/skills/ideate/SKILL.md`
2. `CLAUDE_PLUGIN_ROOT` 未解或解至他 plugin（Windows 有此患）→ 改 glob
   `~/.claude/plugins/cache/*/ideation/*/skills/ideate/SKILL.md`，取版本最高者
3. 依其身之令而行

用戶欲親調者，提示 `/ideation:ideate "[焦點]"`（手動喚不受此限，亦不經本網關之提案）。

## Related

- `present:recommender` — `ideate` 之產物由 `present:html-report` 或 `present:mini-ide` 呈現。
- `/worktrack:plan` — 構想收斂為實作計劃後之去處。
- `dev-standards:ponytail` — 用戶所欲為「最少可行」而非「更多選項」時，改用之。
