---
name: dev-standards-refactor-first-assessment
description: "During planning after grill-task, decide whether preparatory refactor step is needed before implementation — runs four parallel A-rule checks. 規劃時評估現有結構是否支持計劃變更，按需插入預備重構步驟。 Use when: creating implementation plan, after grill-task, before writing implementation steps, assess codebase for refactor, planning refactor-first"
---

# Refactor-First Assessment

評估現有代碼庫結構是否自然支持計劃中的變更。若不支持，在實現步驟前插入預備重構步驟。

## When to run

- 規劃期間，**在**

> Invoke the `Skill` tool with `skill: dev-standards:grill-task` — 獲取任務規格後方可評估。

**之後**
- **在**規劃的實現步驟被寫入**之前**
- 每任務一次，非每文件一次

## Inputs

- 來自 grill-task 的任務規格（範圍、意圖、領域術語）
- `scope.files_to_modify` 中文件的當前內容
- 任務關鍵名詞/動詞的 LCI 搜索結果（找到自然歸屬）

## Four checks

依序執行。任一「no」即向計劃添加預備重構步驟。

### 1. Natural extension

此變更是否有明顯的添加位置？能否指出新代碼清晰歸屬的文件和行？

- **Yes:** 繼續。
- **No:** 結構需先建立歸屬。添加重構步驟：「通過從 Z 提取 Y，為 X 創建歸屬。」

### 2. Naming fit

現有名稱是否為新概念留有空間，或新代碼會與命名不同的現有概念重疊？

- **Yes:** 繼續。
- **No:** 添加重構步驟，在新代碼落地前重命名現有概念或釐清命名。

### 3. Co-location

相關代碼最終會在正確的文件/模塊中嗎？具體地，新代碼的領域概念是否已有歸屬，還是會分散到不相關文件中？

- **Yes:** 繼續。
- **No:** 添加重構步驟，在添加更多代碼前整合該領域的現有代碼。

### 4. Friction

添加新變更時是否需要與現有代碼搏鬥？跡象：深層嵌套、不相關參數穿插傳遞、不應關心的調用者需要更新。

- **No（無摩擦）:** 繼續。
- **Yes（有摩擦）:** 添加重構步驟先降低摩擦。

## Output

一條計劃編輯指令，二選一：

- **Sign off:** "No refactor needed. Proceed with implementation as planned."
- **Insert refactor step:** "Before implementation, add step: `Refactor <target> to <action> (move/rename/extract/inline)`. Then re-run existing tests before the first new RED test."

若多項檢查失敗，按順序插入多個重構步驟：提取/移動 → 重命名 → 降低摩擦。絕不在同一步驟中混合重構與實現。

## Deepening lens (deep vs shallow modules)

評估重構是否值當時，一以此語彙論之（完整定義見 [LANGUAGE.md](LANGUAGE.md)）：

- **Module** —— 凡有 interface + implementation 者。**Interface** —— 調用者必知之一切。**Depth** —— 小 interface 之後的 leverage（深 = 高 leverage；淺 = interface 幾與實現等繁）。**Seam** —— 不就地改而可易行為之處。**Locality** / **Leverage** —— 維護者 / 調用者自 depth 所得。
- **刪除測試（deletion test）：** 設想刪此模塊。複雜度消散 → 乃 pass-through（淺）。複雜度散現於 N 個調用者 → 物有所值（深）。
- **interface 即測試面。** 一 adapter 為假想 seam；二 adapter 方為真 seam。

以 `lci:explore`（模塊圖）+ `lci:trace-symbol`（刪除測試找全調用者）探之；lci 不可用則退回 `Explore` agent 或 Grep。

**碼異味基線（Fowler ch.3）：** 掃描待改代碼之異味——Mysterious Name、Duplicated Code、Feature Envy、Data Clumps、Primitive Obsession、Repeated Switches、Shotgun Surgery、Divergent Change、Speculative Generality、Message Chains、Middle Man、Refused Bequest。各為判斷式啟發（「疑似 Feature Envy」），非硬違規；**已文檔化之項目規範覆蓋基線**，工具（linter/type-checker）已強制者略過。全清單與修法見 [CODE-SMELLS.md](CODE-SMELLS.md)。異味指向淺模塊或錯置 seam 時，即為插入預備重構步驟之信號。

**HTML 報告 → 委派 `present:html-report`。** 多候選架構審查，勿於此內嵌 HTML scaffold。集結結構化數據（標題；每候選 before/after 節；推薦強度徽章：Strong / Worth exploring / Speculative；可選 Mermaid before/after 圖），調 `present:html-report`，其將自包含 Tailwind+Mermaid HTML 寫入 OS temp dir 並開啟。`present` 插件不可用則退回：寫純文本摘要至 temp dir 並印出路徑。Interface-design 探索：[INTERFACE-DESIGN.md](INTERFACE-DESIGN.md)。

領域用 `.claude/rules/glossary.md` 語彙，架構用 LANGUAGE.md 語彙。遵 `.claude/rules/architecture.md` + `docs/adr/` 中之 ADR；候選若與現有 ADR 相牴，標出之（勿靜默重議）。

## Discipline

- 重構步驟必須在寫入新 RED 測試前通過現有測試。若重構破壞了現有測試，那是 bug——在重構步驟中修復，而非實現步驟。
- 重構步驟**僅為 A 類**（預備性，在計劃中）。非機會性清理的後門。見 `.claude/rules/refactor-discipline.md`。
- 若需超過兩個重構步驟，任務可能過大——上報「拆分此任務」，而非堆砌重構。

## Example output

```yaml
assessment:
  natural_extension: yes
  naming_fit: no        # "OrderLine" and "LineItem" both in use
  co_location: yes
  friction: no

refactor_steps_to_insert:
  - "Rename OrderLine -> LineItem across src/orders/ and tests/orders/"
  - "Run existing test suite, confirm GREEN"

then_proceed_with:
  - "Original implementation steps from plan"
```
