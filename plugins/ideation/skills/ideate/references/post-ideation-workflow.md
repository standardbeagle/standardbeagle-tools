# 構思後工作流

第二階段構思代理回傳且編排器合併去重其輸出為主候選列表後，方載此文。第二階段完成前勿載。

## 第三階段：對抗篩選

批判審閱每則候選構想。編排器直接執行此篩選——勿分派子代理進行批判。

除非明確精煉，此階段不生成替代構想。

每則被拒構想寫一行原因。

拒絕標準：
- 過於模糊
- 不可操作
- 與更強構想重複
- 未立基於所陳述之上下文
- 相對可能價值成本過高
- 已由既有工作流或文檔涵蓋
- 有趣但不符合本輪焦點或不足以成為優先方向

以一致評分標準為存活者評分，權衡：立基於所陳述上下文之程度、預期價值、新穎性、實用性、對未來工作之槓桿效應、實施負擔、與更強構想之重疊。

目標產出：
- 預設保留 5-7 則存活者
- 存活過多時，進行第二輪更嚴格篩選
- 少於 5 則存活時，誠實回報，而非降低標準

## 第四階段：呈現存活者

**檢查點 B（V17）。** 呈現前，寫入 `<scratch-dir>/survivors.md`（使用第一階段捕獲之絕對路徑），內含存活者列表及關鍵上下文（焦點提示、立基摘要、拒絕摘要）。此保護批評後狀態，於用戶到達持久化選單前。盡力而為：若寫入失敗（磁碟滿、權限），記錄警告並繼續；檢查點非承載關鍵。複用第一階段生成之相同 `<run-id>` 及 `<scratch-dir>`；運行結束時不清理。

向用戶呈現存活構想。終端審閱循環本身即完整構思週期——持久化、HTML 展示、mini-IDE 審閱與後續計劃產物皆為選擇性。

僅以結構化形式呈現存活構想：

- 標題
- 描述
- 理據
- 缺點
- 信心分數
- 預估複雜度

隨後附簡短拒絕摘要，使用戶可知曉何者被考慮且被剔除。

保持呈現簡潔。允許簡短後續問題及輕量澄清；勿反射性連續滴問。需要更多決策時，優先產出 strategy bundle、principles 或 decision tree，僅問真正 blocking 且不可推斷之問題。

## 第五階段：持久化與展示（選擇性、模式感知）

持久化為選擇性。終端審閱循環即完整構思週期。精煉循環於對話中進行，無檔案或網路成本。持久化僅於用戶明確選擇儲存、分享、HTML 展示、mini-IDE 審閱或交接時觸發。

**模式決定之預設：**

| 動作 | 倉庫模式預設 | 其他模式預設 |
|---|---|---|
| 儲存 | `docs/ideation/YYYY-MM-DD-<topic>-ideation.md` | OS temp markdown artifact |
| HTML 展示 | `present:html-report` | `present:html-report` |
| 互動審閱 / 編輯 | `present:mini-ide` | `present:mini-ide` |
| 計劃交接 | `/worktrack:plan`（需 user 選擇） | 對話內計劃或 user 指定目的地 |
| 結束 | 僅對話即可 | 僅對話即可 |

任一模式亦可依明確要求使用另一目的地（「雖為倉庫模式但儲存至臨時檔」、「雖為其他模式但儲存至本地檔案」）。直接遵從此類覆寫。

### 5.1 檔案儲存（倉庫模式預設；其他模式依要求）

1. 確保 `docs/ideation/` 存在
2. 選擇檔案路徑：
    - `docs/ideation/YYYY-MM-DD-<topic>-ideation.md`
    - 無焦點時用 `docs/ideation/YYYY-MM-DD-open-ideation.md`
3. 寫入或更新構思文檔

使用此結構，僅在必要時省略明確不相關之欄位：

```markdown
---
date: YYYY-MM-DD
topic: <kebab-case-topic>
focus: <optional focus hint>
mode: <repo-grounded | elsewhere-software | elsewhere-non-software>
---

# Ideation: <Title>

## Grounding Context
[Phase 1 之立基摘要——倉庫模式標示 "Codebase Context"，其他模式標示 "Topic Context"]

## Ranked Ideas

### 1. <Idea Title>
**Description:** [具體解釋]
**Rationale:** [何以此構想在所陳述上下文中為強]
**Downsides:** [取捨或成本]
**Confidence:** [0-100%]
**Complexity:** [Low / Medium / High]
**Status:** [Unexplored / Explored]

## Rejection Summary

| # | Idea | Reason Rejected |
|---|------|-----------------|
| 1 | <Idea> | <Reason rejected> |

## Selected Path
[若 user 已選]

## Governing Principles
[若 user 要 principles]

## Decision Tree
[若 user 要 decision tree；可用 mermaid]

## Implementation Plan Draft
[若 user 要 coherent plan；此為計劃草案，非實作]
```

若恢復：
- 原地更新既有檔案
- 保留已探索標記

### 5.2 HTML 展示（public core presentation）

當 user 要「show it」、「make a report」、「HTML presentation」、「decision tree/report」或內容視覺化明顯有益時，使用 `present:html-report`。

輸入應包含：

- title: `Ideation: <topic>`
- sections:
  - Grounding context
  - Ranked ideas
  - Rejection summary
  - Recommended path
  - Principles（若已產生）
  - Decision tree（若已產生）
  - Implementation plan draft（若已產生）
- diagrams:
  - Mermaid flowchart for decision tree when useful
  - Mermaid sequence/graph only when it clarifies, not for decoration

`present:html-report` 寫入 OS temp，開啟瀏覽器，並列印絕對路徑。勿把一次性 HTML 報告寫入 repo，除非 user 明確要求。

### 5.3 Mini-IDE / editor review（public core editor）

當 user 應排序、標註、編輯或確認內容時，使用 `present:mini-ide`，不要把 editor flow 綁到 ideation 私有實作。

Screen kind 選擇：

- `cards` — 存活構想排序、分群、淘汰、新增 cluster
- `strategy-card` — 方案或實作方向比較；先 rank 後 select
- `summary-confirm` — 目標、約束、風險、替代 framing 之逐條修訂
- `annotate-artifact` — 對 HTML report、diagram、plan artifact 做元素/文字/mermaid node 標註
- `decision` — 記錄 user 已批准/修訂/拒絕之決策

若 mini-IDE 不可用，降級為終端 markdown + `AskUserQuestion`。此為 UI 能力降級，不得改變核心決策品質。

## 第六階段：精煉或交接

使用平台之阻斷式提問工具詢問下一步（Claude Code 之 `AskUserQuestion`，Codex 之 `request_user_input`，Gemini 之 `ask_user`）。若無提問工具，於聊天中呈現編號選項並等候用戶回覆。

**問題：** "What should the agent do next?"

提供此選項集；根據已知 context 可省略明顯無關者，但勿把後續拆成多輪小問題：

1. **Refine in chat** —— 新增構想、重新評估、深化某個方向；無檔案或 UI 副作用。
2. **Open HTML report** —— 以 `present:html-report` 呈現 ranking、取捨、principles、decision tree 或 plan draft。
3. **Review in mini-IDE** —— 以 `present:mini-ide` 做 cards / strategy-card / summary-confirm / annotate-artifact 互動審閱。
4. **Derive principles** —— 產出一組可決定細節之 governing principles，含適用/不適用條件。
5. **Build decision tree** —— 產出完整 decision tree：root decision、branches、tradeoffs、reconsider triggers；可附 Mermaid。
6. **Produce implementation plan draft** —— 產出 coherent implementation plan，含 scope、critical files、risks、verification；不寫程式碼。
7. **Save and end** —— 依第五階段模式預設持久化或僅結束。

不儲存退出無需專用選單選項。選擇選項 1 並停止對話，或使用提問工具之自由文字逃逸直接說明——持久化為選擇性，終端審閱循環已為完整構思週期。

完成時勿刪除運行之臨時目錄（`<scratch-dir>`，於第一階段解析）。V15 網路研究快取為會話作用域，同一會話之後續構思調用跨 run-id 複用；每次運行清理將破壞該複用。

### 6.1 在對話中精煉構思

依意圖路由精煉：

- `add more ideas` 或 `explore new angles` → 返回第二階段
- `re-evaluate` 或 `raise the bar` → 返回第三階段
- `dig deeper on idea #N` → 僅擴展該構想之分析
- `turn this into principles` → 進 §6.4
- `make a decision tree` → 進 §6.5
- `make a plan` → 進 §6.6

精煉期間不觸發持久化，除非 user 要展示、審閱、儲存或交接。

### 6.2 Open HTML report

使用 §5.2。報告生成後，列出絕對路徑，並提供下一步：在 mini-IDE 標註、產 principles、產 decision tree、產 plan draft、保存或結束。

### 6.3 Review in mini-IDE

使用 §5.3。讀取 event stream 後，根據事件類型更新構想列表、策略選擇、摘要或 artifact。若 user request-changes，修訂後重新發 screen；若 approve，記錄決策並回第六階段選項。

### 6.4 Derive principles

輸出 principles 時，每條應含：

- **Principle** — 可操作規則
- **Why** — 源於哪些 ranked ideas / constraints
- **Determines** — 它能決定哪些細節
- **Tradeoff** — 它犧牲什麼
- **Reconsider when** — 何時重審

避免空泛價值詞。Principle 必須能令一批具體細節自動落定，否則只是 preference。

### 6.5 Build decision tree

輸出 decision tree 時包含：

- root decision
- branch options
- per-branch consequences
- locks_out / unlocks
- recommended default
- reconsider triggers
- Mermaid diagram when helpful

Decision tree 目標是讓 user 或後續 agent 可依條件自動選路，而非等待逐問。

### 6.6 Produce implementation plan draft

可產出 coherent implementation plan，但不執行。Plan 應含：

- Context / goal
- Scope and non-goals
- Critical files or systems likely affected
- Steps in logical order
- Risks and mitigations
- Verification plan
- Handoff suggestion: `/worktrack:plan` for execution-ready task breakdown when user wants implementation

若 plan 所需資訊仍缺，先用 assumptions 明列，只有承重且不可推斷之決策才問 user。

### 6.7 Save and end

依模式預設持久化（倉庫模式用 5.1；其他模式用 OS temp markdown 或 user-specified path），然後結束。若 user 改要求非預設目的地，遵從該明確要求。

檔案儲存（及可選提交）後，結束會話——不返回第六階段選單。

## 品質門檻

完成前檢查：

- 構想集立基於所陳述之上下文（倉庫模式為程式碼庫；其他模式為用戶提供之主題）
- 候選列表於篩選前已生成
- 原始多構想 → 批評 → 存活者機制已保留
- 若使用子代理，其增進多樣性而未取代核心工作流
- 每則被拒構想皆有原因
- 存活者實質優於天真之「給我構想」列表
- 不以慢速多輪滴問取代完整產物；僅問真正 blocking 問題
- HTML 展示使用 `present:html-report`，不手寫一次性報告 scaffold
- 互動審閱使用 public core `present:mini-ide`，不綁私有 skill runtime
- 持久化遵循用戶選擇——僅終端會話未寫檔案或呼叫 UI
- 對構想之行動路由至 principles、decision tree、plan draft、HTML report、mini-IDE review 或 `/worktrack:plan`；不寫程式碼
