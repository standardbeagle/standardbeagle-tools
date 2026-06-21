---
name: agnt-design-md
description: "Populate a DESIGN.md design-system spec by harvesting real tokens (colors, typography, spacing, radius, elevation) from the LIVE running frontend via agnt proxy — not from guesses or static CSS files. 由實際運行前端提取真實設計令牌生成 DESIGN.md。 Use when: create design.md, generate design system spec, extract design tokens from site, document brand tokens, reverse-engineer design system from running app"
disable-model-invocation: true
---

# DESIGN.md 生成技能 — Populate DESIGN.md from a live frontend

DESIGN.md（見 https://github.com/google-labs-code/design.md）給編碼代理持久結構化之設計系統理解：YAML front matter 載機器可讀令牌 + markdown body 載人類可讀設計意圖。

此技能 **由實際運行前端提取真實值** — 非臆測、非讀靜態 CSS。經 agnt proxy 取 computed styles，故令牌反映瀏覽器真渲染態（含 CSS 變數、繼承、媒體查詢結果）。

## 前提 — Prerequisites

代理必須運行且站點已連接。若無：
- 啟動：見 `agnt:dev-proxy` / `agnt:process-proxy`
- 確認頁面已透過 proxy URL 載入（`agnt:current-page` 驗之）

`<proxy_id>` 下稱 `id`。

## 流程 — Workflow

### 1. 採樣代表性元素 — Sample representative elements

擇覆蓋設計系統之元素：`body`、headings (`h1`–`h3`)、`p`、primary/secondary `button`、`a`、`input`、card/panel 容器、nav。對每個取 computed styles：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "<id>",
    "code": "__devtool.getComputed('h1', ['color','font-family','font-size','font-weight','line-height','letter-spacing','margin','padding'])"
  }
}
```

優先 `__devtool.*` 助手，勿寫裸 `getComputedStyle` 鏈（見 `agnt:browser-diagnostics`）。批量檢視用 `__devtool.inspect(sel)`。

### 2. 提取 CSS 自訂屬性 — Harvest CSS custom properties

多數現代設計系統以 `:root` CSS 變數定義令牌。直取之為最高保真來源：

```
"code": "(()=>{const s=getComputedStyle(document.documentElement);const o={};for(const p of s){if(p.startsWith('--'))o[p]=s.getPropertyValue(p).trim();}return o;})()"
```

（此為合法用裸 JS 之例外：枚舉自訂屬性無 `__devtool` 等價助手。）

### 3. 正規化令牌 — Normalize tokens

- 色：computed `color`/`background-color` 回 `rgb()`/`rgba()`；轉 hex 存 YAML。聚類去重，命名語意化（`primary`、`surface`、`text-muted`），勿用 `gray-1`。
- 字體：分組成 scale（`h1`…`body`、`caption`）；存 `fontFamily`、`fontSize`、`fontWeight`、`lineHeight`。
- 間距：採 margin/padding/gap 之眾值，推 scale（如 4/8/16/24）。
- 圓角：採 `border-radius` 眾值 → `sm`/`md`/`lg`。
- 立面：採 `box-shadow` 分層。

採樣 → 推 scale，非逐元素硬編。記錄不確定處供使用者確認。

### 4. 寫 DESIGN.md — Emit the file

依 `references/schema.md` 之 schema 與節序。複製 `assets/DESIGN.template.md` 為起點，填真實值。Markdown body 各節（Overview、Colors、Typography、Layout、Elevation & Depth、Shapes、Components、Do's and Don'ts）以採得之證據述設計意圖 — 勿留佔位。

### 5. 驗證 — Verify

- 每個 component 令牌引用之 color/typography token 須存在於 front matter。
- 抽查 2–3 令牌：重執 `__devtool.getComputed` 對照寫入值。
- 報告採樣涵蓋之元素與跳過者（勿默默截斷）。

## 資源 — Resources

- **`references/schema.md`** — 完整 YAML 令牌 schema（Color/Typography/Dimension 型別）、節序、Heritage 範例。
- **`assets/DESIGN.template.md`** — 可複製之空白 DESIGN.md 骨架。
