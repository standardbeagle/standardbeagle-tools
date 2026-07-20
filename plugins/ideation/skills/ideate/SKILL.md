---
name: ideation-ideate
description: "生成、批判、呈現並收斂構想。Generate, critically evaluate, present, and converge ideas into ranked options, principles, decision trees, or implementation-plan artifacts. Use when: 'what should I improve', 'give me ideas', 'ideate on X', 'surprise me', 'what would you change', want options or a visual HTML idea report. Skip: clear bug with repro, mechanical refactor, direct implementation with complete spec."
disable-model-invocation: true
argument-hint: "\"[feature, focus area, or constraint]\""
---

<!--
Originally ported from Compound Engineering (`ce-ideate`).
Upstream: https://github.com/every-org/compound-engineering — MIT License.
Body content preserved verbatim; only frontmatter normalized per
standardbeagle-tools R1 §2.2 (bilingual Use when/Skip when triggers added).
Dispatch targets `research:ce-*-researcher` rewritten to `research:*-researcher`
per R4 §5 (drop `ce-` prefix). Prose now treats ideation as the full
idea-to-artifact convergence entry point; legacy CE handoff references removed.
-->

# 生成改進構想

**注意：今年為 2026 年。** 構想文檔標註日期及檢查近期構想產物時使用。

`ideation` 為構想至決策產物之單一入口。

- 回答：「哪些構想最值得探索？」
- 回答：「選定構想應如何被理解、取捨、決定？」
- 產出：排序構想、HTML 展示、互動審閱、原則、決策樹或實作計劃草案。

此工作流於 `docs/ideation/` 中可選產出排序之構想產物。其**不**寫程式碼、不 scaffold、不執行實作；但可產出供 user 審閱或交 `/worktrack:plan` 之計劃、原則與決策產物。

## 互動方式

可用時使用平台之阻塞式提問工具（Claude Code 之 `AskUserQuestion`、Codex 之 `request_user_input`、Gemini 之 `ask_user`）。否則於聊天中呈現編號選項並等候用戶回覆。

勿反射性滴問。先給完整可選產物：coherent plan、principles、decision tree、HTML report、或 mini-IDE review。僅當答案會改變下一步且無法自 prompt/code/memory 合理推斷時才問；多個互相獨立之 blocking 問題應一次批出。

## 焦點提示

<focus_hint> #$ARGUMENTS </focus_hint>

將任何提供之參數解讀為選擇性上下文。其可能為：

- 一個概念如 `DX improvements`
- 一個路徑如 `plugins/compound-engineering/skills/`
- 一個約束如 `low-complexity quick wins`
- 一個數量提示如 `top 3`、`100 ideas` 或 `raise the bar`

若未提供參數，以開放式構想生成進行。

## 核心原則

1. **生成前先紮根** ——先掃描實際碼庫。勿生成脫離倉庫之抽象產品建議。
2. **生成多數 → 批判全部 → 僅解釋存活者** ——品質機制為附理由之明確拒絕，非樂觀排名。勿讓額外流程掩蓋此模式。
3. **將行動路由至決策產物** ——構想生成識別有前途之方向；後續應收斂為原則、決策樹、HTML/mini-IDE 審閱產物或實作計劃草案。勿寫程式碼；可在 user 要求時交 `/worktrack:plan`。

## 執行流程

### 階段零：恢復與範圍

#### 0.1 檢查近期構想工作

查看 `docs/ideation/` 中過去 30 天內建立之構想文檔。

以下情況視既有構想文檔為相關：
- 主題匹配請求之焦點
- 路徑或子系統重疊請求之焦點
- 請求為開放式且有明顯近期開放構想文檔
- 議題扎根狀態匹配：當前參數指示議題追蹤器意圖時勿提供恢復非議題構想，反之亦然——視為不同主題

若相關文檔存在，詢問是否：
1. 自其繼續
2. 重新開始

若繼續：
- 讀取文檔
- 摘要已探索之物
- 保留先前構想狀態
- 更新既有檔案而非建立重複

#### 0.2 分類主題模式

分類**構想之主題**（用戶想要關於什麼的構想），非環境。任何倉庫中之用戶可構想與該倉庫無關之物；在 `/tmp` 中之用戶可構想其腦中之程式碼。

做兩個順序二元決策，各列舉負面信號：

**決策一——倉庫扎根 vs. 他處。** 先權衡提示內容，次考量主題-倉庫一致性，CWD 倉庫存在僅為支持證據。

- **倉庫扎根**之正面信號：提示引用倉庫檔案、程式碼、架構、模組、測試或工作流；主題明確受當前碼庫界定。
- **他處**之負面信號（推向他處）：提示命名倉庫中不存在之物（定價、命名、敘事、商業模式、個人決策、品牌、內容、市場定位）；主題為創意、商業或個人，無程式碼表面。

**決策二（僅當決策一 = 他處時觸發）——軟體 vs. 非軟體。** 以構想之*主題*是否為軟體產物或系統來分類，非以個別構想最終歸宿。若主題涉及產品、應用、SaaS、網頁/行動 UI、功能、頁面或服務，即為**他處-軟體**——即使構想本身關於文案、UX、CRO、定價、入門、視覺設計或該軟體產品之定位。**他處-非軟體**保留給完全無軟體表面之主題：公司或品牌命名（獨立於產品）、敘事與創意寫作、個人決策、非數位商業策略、實體產品設計。

範例分類：

- "Improve conversion on our sign-up page" → 他處-軟體（主題為頁面）
- "Redesign the onboarding flow" → 他處-軟體（主題為流程）
- "Pricing page A/B test ideas" → 他處-軟體（主題為頁面）
- "Features to add to our note-taking app" → 他處-軟體
- "Name my new coffee shop" → 他處-非軟體（主題為品牌）
- "Plot ideas for a short story" → 他處-非軟體（主題為敘事）
- "Options for my next career move" → 他處-非軟體（主題為個人決策）

於頂部以一句話陳述推斷之方式，使用用戶能辨識之通俗語言。永不向用戶列印內部分類標籤（`repo-grounded`、`elsewhere-software`、`elsewhere-non-software`）——那些名稱僅供路由。依下方模板適應實際主題；自主題本身取一領域詞彙（如「landing page」、「onboarding flow」、「naming」、「career decision」）取代模式標籤。

- **倉庫扎根：** "Treating this as a topic in this codebase — about X. Say 'actually this is outside the repo' to switch."
- **他處-軟體：** "Treating this as a product/software topic outside this repo — about X. Say 'actually this is about this repo' or 'actually this has no software surface' to switch."
- **他處-非軟體：** "Treating this as a [naming | narrative | business | personal] topic — about X. Say 'actually this is about a software product' or 'actually this is about this repo' to switch."

修正提示亦須為通俗語言（"actually this is outside the repo"、"actually this is about this repo"），非內部標籤（"actually elsewhere-software"）。

**模糊時主動確認（V16）。** 分類器信心低時——單關鍵詞或短提示可乾淨映射至任一模式（`/ce-ideate ideas`、`/ce-ideate ideas for the docs`）、CWD/提示信號衝突、或主題同時提及倉庫內外表面——透過平台之阻塞式提問工具（Claude Code 之 `AskUserQuestion`、Codex 之 `request_user_input`、Gemini 之 `ask_user`）在**分派階段一紮根前**問一個確認問題。清晰案例一句話之推斷模式陳述即足；勿問。

範例措辭（依手邊提示調整；遵循插件 AGENTS.md 中之互動提問工具設計規則——自足標籤、上限 4、第三人稱、前置區分詞、不洩露內部模式名）：

- **題幹：** "What should the agent ideate about?"
- **選項：**
  - "Code in this repository — features, refactors, architecture"
  - "A topic outside this repository — business, design, content, personal decisions"
  - "Cancel — let me rephrase the prompt"

若用戶確認或選擇「elsewhere」，仍跑決策二以選擇他處-軟體 vs. 他處-非軟體。

**路由規則。** 當決策二 = 非軟體時，仍跑階段一他處模式紮根（用戶上下文綜合 + 預設網路研究；跳過短語受尊重）。Learnings-researcher 在此模式預設跳過——CWD 之 `docs/solutions/` 罕能轉移至命名、敘事、個人或非數位商業主題；見階段一之完整理由。然後載入 `references/universal-ideation.md` 並遵循之以取代階段二之軟體框架分派及階段六選單敘事。此載入為非選擇性——該檔包含領域無關之生成框架、批判評分標準及收尾選單，取代此模式下之階段二與構想後選單，這些細節不存在於此主體中。憑記憶即興創作會為非軟體主題產生錯誤引導。勿在任何時刻跑倉庫特定之碼庫掃描。`references/post-ideation-workflow.md` 中之儲存與展示規則仍適用，含本地檔案、`present:html-report` 與 `present:mini-ide` 後備路徑。

若任何提示擴展或攝取步驟（下方 0.4）實質改變主題，在分派階段一前重新評估模式陳述——依將行動之範圍分類，非首次閱讀之範圍。

#### 0.3 詮釋焦點與數量

自參數推斷三件事：

- **焦點上下文** ——概念、路徑、約束或開放式
- **數量覆寫** ——任何改變候選者或存活者數量之提示
- **議題追蹤器意圖** ——用戶是否想要議題/錯誤資料作為輸入來源。**僅倉庫模式**——他處模式不觸發。

議題追蹤器意圖在參數之主要意圖為分析議題模式時觸發：`bugs`、`github issues`、`open issues`、`issue patterns`、`what users are reporting`、`bug reports`、`issue themes`。

以下參數**不**觸發：僅將錯誤作為焦點提及：`bug in auth`、`fix the login issue`、`the signup bug`——此為焦點提示，非分析議題追蹤器之請求。

組合時（如 `top 3 bugs in authentication`）：先偵測議題追蹤器意圖，次數量覆寫，餘者為焦點提示。焦點縮窄哪些議題重要；數量覆寫控制存活者數量。

預設數量：
- 每個構想子代理生成約 6-8 個構想（預設路徑 6 框架下約 36-48 個原始構想，或議題追蹤器模式 4 框架下約 24-32 個；6 框架路徑去重後約 25-30 個存活者，4 框架路徑較少）
- 保留前 5-7 個存活者

尊重明確覆寫如：
- `top 3`
- `100 ideas`
- `go deep`
- `raise the bar`

以合理詮釋取代形式解析。

#### 0.4 輕量上下文攝取（僅他處模式，僅軟體主題）

倉庫模式跳過此步（階段一紮根代理做此工作）。非軟體他處模式亦跳過（通用引導參照管轄攝取）。

詢問前先施**區辨測試**：將用戶所述上下文之一塊替換為對比替代方案是否會實質改變哪些構想存活？若會，上下文為承重者——不問即進。若不會，問 1-3 個窄選問題，基於用戶已提供者構建而非從模板開始。預設自由形式問題；僅當答案空間小且離散時用單選（如類型、調性）。每次回答後重新施測試再問下一個。以敷衍回應（"idk just go"）為停止信號，將真正之「無約束」回答視為真正答案。

用戶前提供豐富上下文時（貼文、簡報、既有草稿），一行確認理解後完全跳過攝取。

#### 0.5 成本透明通知

分派階段一前，以一行短句呈現推斷模式下之代理數量，俾多代理成本非不可見。自實際分派決策計算數量：1 紮根上下文代理（倉庫模式下為碼庫掃描；他處下為用戶上下文綜合）+ 1 learnings（他處-非軟體中跳過）+ 1 網路研究員 + 6 構想 = 倉庫模式與他處-軟體基線 9，他處-非軟體 8。議題追蹤器意圖觸發時（僅倉庫模式）：加 1 議題情報代理並將構想自 6 降至 4，淨減 1（基線 8）。用戶選擇加入 Slack 研究則加 1。用戶發出網路研究跳過短語或 V15 重用將觸發則減 1。

範例（預設、無跳過、無選擇加入）：

- **倉庫模式：** "Will dispatch ~9 agents: codebase scan + learnings + web research + 6 ideation sub-agents. Skip phrases: 'no external research', 'no slack'."
- **倉庫模式，議題追蹤器意圖：** "Will dispatch ~8 agents: codebase scan + learnings + web research + issue intelligence + 4 ideation sub-agents. Skip phrases: 'no external research', 'no slack'." 反映成功主題路徑；若議題情報回傳不足信號（見階段一），構想回退為 6 個子代理，總數變為 ~9。
- **他處-軟體：** "Will dispatch ~9 agents: context synthesis + learnings + web research + 6 ideation sub-agents. Skip phrases: 'no external research'."
- **他處-非軟體：** "Will dispatch ~8 agents: context synthesis + web research + 6 ideation sub-agents. Skip phrases: 'no external research'."

此行為資訊性；用戶不需確認。

### 階段一：模式感知紮根

生成構想前，收集紮根資訊。分派集合取決於階段 0.2 所選模式。網路研究在所有模式中運行（跳過短語受尊重）。Learnings 在倉庫模式與他處-軟體中運行，**在他處-非軟體中預設跳過**——CWD 倉庫之 `docs/solutions/` 幾乎總是包含無法轉移至命名、敘事、個人或非數位商業主題之工程模式。

於階段一起始生成一次 `<run-id>`（8 位十六進位字元）。V15 快取檔案（此階段）與 V17 檢查點（階段二與四）重用之，使它們共用一個每次執行之臨時目錄。

**預解析臨時目錄路徑。** 臨時空間在 OS temp（非 `.context/`），依倉庫臨時空間慣例中跨調用可重用規則——構想主題鮮少綁定於 CWD 倉庫（尤其在他處模式），故將臨時空間保持於任何倉庫樹之外為正確預設。執行一條 bash 指令建立目錄並擷取其**絕對路徑**供後續使用。勿將 `${TMPDIR:-/tmp}` 作為字面字串傳遞予非 shell 工具（Write、Read、Glob）；這些工具不執行 shell 展開。

```bash
SCRATCH_DIR="${TMPDIR:-/tmp}/compound-engineering/ce-ideate/<run-id>"
mkdir -p "$SCRATCH_DIR"
echo "$SCRATCH_DIR"
```

使用回傳之絕對路徑（如 macOS 上 `/var/folders/.../T/compound-engineering/ce-ideate/a3f7c2e1`、Linux 上 `/tmp/compound-engineering/ce-ideate/a3f7c2e1`）作為 `<scratch-dir>` 供此運行中每個後續檢查點寫入與快取讀取。運行目錄不在階段六完成時刪除——V15 快取為對話範圍且跨 run-id 重用，檢查點遵循跨調用可重用慣例保留對話範圍產物供後續調用發現。

**前台**並行運行紮根代理（勿背景化——結果在階段二前需要）：

**倉庫模式分派：**

1. **快速上下文掃描** ——以平台最便宜之勝任模型（如 Claude Code 中 `model: "haiku"`）分派通用子代理，提示如下：

   > Read the project's AGENTS.md (or CLAUDE.md only as compatibility fallback, then README.md if neither exists), then discover the top-level directory layout using the native file-search/glob tool (e.g., `Glob` with pattern `*` or `*/*` in Claude Code). Return a concise summary (under 30 lines) covering:
   > - project shape (language, framework, top-level directory layout)
   > - notable patterns or conventions
   > - obvious pain points or gaps
   > - likely leverage points for improvement
   >
   > Keep the scan shallow — read only top-level documentation and directory structure. Do not analyze GitHub issues, templates, or contribution guidelines. Do not do deep code search.
   >
   > Focus hint: {focus_hint}

2. **Learnings 搜尋** ——以構想焦點之簡要摘要分派 `research:learnings-researcher`。

3. **網路研究**（一律開啟；見下方「網路研究」子區段之跳過短語與 V15 快取處理）。

4. **議題情報**（條件式）——若階段 0.3 偵測到議題追蹤器意圖，以焦點提示分派 `research:issue-intelligence-analyst`。與其他代理並行運行。

   若代理回傳錯誤（gh 未安裝、無遠端、認證失敗），向用戶記錄警告（"Issue analysis unavailable: {reason}. Proceeding with standard ideation."）並以剩餘紮根繼續。

   若代理回報少於 5 個總議題，注明「Insufficient issue signal for theme analysis」並以預設構想框架進入階段二。

**他處模式分派（跳過碼庫掃描；用戶提供之上下文為主要紮根）：**

1. **用戶上下文綜合** ——分派通用子代理（最便宜之勝任模型）讀取階段 0.4 攝取之用戶提供上下文加任何豐富提示材料，回傳映射碼庫上下文形狀之結構化紮根摘要（專案形狀 → 主題形狀；顯著模式 → 已述約束；痛點 → 用戶命名之痛點；槓桿點 → 上下文暗示之機會鉤子）。這保持階段二子代理對紮根來源不可知。

2. **Learnings 搜尋** *（僅他處-軟體；他處-非軟體中預設跳過）* ——以主題摘要分派 `research:learnings-researcher` 以防相關之機構知識存在。他處-非軟體跳過：CWD 之 `docs/solutions/` 不太可能與非數位主題主題相關，運行有以無關工程模式污染生成之風險。

3. **網路研究** ——同倉庫模式（見下方子區段）。

議題情報不適用於他處模式。Slack 研究兩模式皆為選擇性加入（見下方「Slack 上下文」）。

#### 網路研究（V5、V15）

兩模式一律開啟。用戶於提示或先前回答中說 "no external research"、"skip web research" 或等效語時跳過；此情況下自分派中省略 `research:web-researcher` 並於合併紮根摘要中注明跳過。

透過附屬快取在同一對話中重用先前網路研究——見 `references/web-research-cache.md` 了解快取檔案形狀、重用檢查、附接行為及平台降級規則。於此運行中首次將分派 `research:web-researcher` 時讀取之（及每次快取可能適用之後續分派）。

分派 `research:web-researcher` 時，傳入：焦點提示、簡要規劃上下文摘要（一兩句話）及模式。勿傳入碼庫內容——代理在外部運作。

#### 合併紮根摘要

將所有分派結果合併為簡短紮根摘要，使用以下區段（無產出者省略）：

- **碼庫上下文** *（倉庫模式）* 或 **主題上下文** *（他處模式）* ——專案/主題形狀、顯著模式或已述約束、痛點、槓桿點
- **過往 learnings** ——來自 `docs/solutions/` 之相關機構知識
- **議題情報** *（存在時，僅倉庫模式）* ——主題摘要含標題、描述、議題數量及趨勢方向
- **外部上下文** *（網路研究運行時）* ——先前藝術、相鄰解決方案、市場信號、跨領域類比。V15 重用觸發時注明 "(reused from earlier dispatch)"
- **Slack 上下文** *（存在時）* ——組織脈絡

**失敗處理。** 紮根代理失敗遵循「警告並繼續」——永不阻塞於紮根失敗。若 `research:web-researcher` 失敗（網路、工具不可用），記錄警告（"External research unavailable: {reason}. Proceeding with internal grounding only."）並繼續。若他處模式攝取未產出可用上下文，在紮根摘要中注明上下文薄弱，俾階段二子代理得以更廣泛之生成補償。

**Slack 上下文**（選擇性加入，兩模式）——永不自動分派。用戶要求 Slack 上下文且 Slack 工具可用時（於當前環境中尋找任何 `slack-researcher` 代理或 `slack` MCP 工具），以焦點提示與其他階段一代理並行分派 `research:slack-researcher`。工具存在但用戶未要求時，在紮根摘要中提及可用性俾其選擇加入。用戶要求但 Slack 工具不可達時，顯示安裝提示。

### 階段二：發散構想生成

批判任何構想前先生成完整候選列表。

以繼承之模型並行分派構想子代理（勿降級——創意構想需編排者之推理水準）。省略 `mode` 參數俾用戶已配置之權限設定生效。分派數量依模式條件化：**僅當階段 0.3 偵測到議題追蹤器意圖且議題情報代理回傳可用主題時為 4 個子代理**（見下方覆寫——聚類衍生框架上限 4）；**否則 6 個子代理**，包括階段一意圖觸發但未回傳主題之不足議題信號後備。每個目標 ~6-8 個構想（6 框架下約 36-48 個原始構想或 4 框架下約 24-32 個，6 框架路徑去重後約 25-30 個存活者，4 框架路徑較少）。數量覆寫適用時調整每代理目標（如 "100 ideas" 提高，"top 3" 可能降低存活者數量）。

給每個子代理：紮根摘要、焦點提示、每代理數量目標及僅生成原始候選（非批判）之指令。每個代理之前幾個構想往往顯而易見——推過它們。每個構想皆紮根於階段一紮根摘要。

分配每個子代理不同之構想框架作為**起始偏見，非約束**。提示各自從分配之視角開始但追隨任何有前途之線索——跨框架之構想最有價值。

**框架選擇（模式對稱——倉庫與他處模式相同六框架）：**

1. **痛苦與摩擦** ——用戶、操作者或主題層級之痛點；什麼始終緩慢、破碎或惱人。
2. **反轉、移除或自動化** ——反轉痛苦步驟、完全移除之或自動化消除之。
3. **打破假設與重新框架** ——什麼被視為固定實為選擇；提升一層或側向重新框架。
4. **槓桿與複利** ——一旦做出即使許多未來行動更便宜或更強之選擇；二階效應。
5. **跨領域類比** ——透過問完全不同領域如何解決結構上類似之問題來生成構想。紮根領域為用戶主題；類比領域為任何他處（其他產業、生物學、遊戲、基礎設施、歷史）。推過顯而易見之類比至非顯而易見者。
6. **約束翻轉** ——將顯而易見之約束反轉為其對立或極端。若預算為 10 倍或 0？若團隊為 100 人或 1 人？若無用戶或有百萬？將結果設計作為候選，即使約束翻轉本身不現實。

**議題追蹤器模式覆寫（僅倉庫模式）。** 當議題追蹤器意圖活躍且議題情報代理回傳主題時：每個高/中信心主題成為一個框架。若聚類衍生框架少於 3 個，以 6 框架預設池中之框架填充（依上列順序）。上限 4 個——議題追蹤器模式刻意保持更緊之分派。

要求每個子代理每個構想回傳精簡結構：title、summary、why_it_matters、evidence/grounding hooks、選填之 boldness 或 focus_fit 信號。

所有子代理回傳後：

1. 合併並去重為一個主候選列表。
2. 綜合跨領域組合——掃描不同框架中可組合為更強構想之構想（預期最多 3-5 個添加）。
3. 若提供了焦點，在不排除更強之相鄰構想前提下將合併列表權重傾向之。
4. 適當時跨多維度分佈構想：工作流/DX、可靠性、擴展性、缺失能力、文檔/知識複利、品質/維護、對未來工作之槓桿。

**檢查點 A（V17）。** 跨領域綜合步驟完成且原始候選列表合併後，立即寫入 `<scratch-dir>/raw-candidates.md`（使用階段一擷取之絕對路徑），含完整候選列表及子代理歸屬。這在最昂貴產出（6 個並行子代理分派 + 去重）進入階段三批判可能壓縮上下文前保護之。盡力而為：若寫入失敗（磁碟滿、權限），記錄警告並繼續；檢查點非承重者。運行結束不清理（運行目錄保留俾 V15 快取在同一對話中跨 run-id 可重用——見階段六）。

合併與綜合後——呈現存活者前——載入 `references/post-ideation-workflow.md`。此載入為非選擇性。該檔含對抗過濾評分標準、產物模板、品質門檻及正式階段六交接選單（Refine、HTML report、mini-IDE review、Principles、Decision tree、Implementation plan、Save and end）——這些選項不出現在此主體中任何地方。跳過載入會靜默退化每個後續步驟；代理憑記憶即興創作選單而非呈現文檔化選項。「快速」意味更少階段二子代理，非跳過參照。勿在階段二代理分派完成前載入此檔。
