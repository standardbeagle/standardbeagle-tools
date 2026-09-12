---
name: agnt-screenshot
description: "\"Take screenshot of current browser page. 截取現瀏覽頁圖. Use when: screenshot page, capture current view, take page snapshot, document visual state, capture browser output\""
allowed-tools: "[\"mcp__agnt__snapshot\", \"mcp__agnt__proxy\", \"mcp__agnt__proxylog\"]"
---

從代理瀏覽器頁面截圖。

## 首選方法 — `snapshot` 工具

```
snapshot {action: "screenshot", proxy_id: "dev"}
```

選項：
- `name`：截圖名稱（預設 `"screenshot"`）
- `full_page: true`：捕獲整個可捲動頁面
- `selector: ".header"`：捕獲特定元素
- `id`：`proxy_id` 之別名（向下相容）

範例：
```
snapshot {action: "screenshot", proxy_id: "dev", name: "homepage", full_page: true}
snapshot {action: "screenshot", proxy_id: "dev", selector: ".header"}
```

返回觸發確認。檔案路徑於下一步 `proxylog` 中取得：

```
proxylog {proxy_id: "dev", types: ["screenshot"], limit: 1}
```

日誌條目含 `file_path`、`timestamp`、`width`、`height`。

## 替代方法 — 直接 `proxy exec`

當 daemon 模式不可用，或需自訂截圖邏輯：

```
proxy {action: "exec", id: "dev", code: "await __devtool.screenshot('screenshot')"}
```

然後查日誌：
```
proxylog {proxy_id: "dev", types: ["screenshot"], limit: 1}
```

## 參數命名規則

- `proxy_id`（首選）/ `process_id`（首選）為標準名稱
- `id` 接受為別名，提升 ergonomics
- 兩者同時提供時，`proxy_id` 勝出

注：若無瀏覽器連接至代理，此操作將失敗。確保用戶已在瀏覽器開啟代理URL。

## WSLg 無頭 Chromium 停格 — 原始數據

Symptom on a WSL2 host with WSLg (`DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-0` set): a
Playwright-launched Chromium records ~24 frames per take whatever its length and
`page.screenshot` never returns. The binary is never the variable — headless shell,
full chromium and system Chrome behave the same. Measured 2026-09-11, Playwright
1.60, Chrome 148, 5 s take of a `requestAnimationFrame` page:

| launch | display vars | frames |
|---|---|---|
| Playwright defaults | set | 24 |
| Playwright defaults | unset (`env -u DISPLAY -u WAYLAND_DISPLAY`) | 138 |
| `ignoreDefaultArgs: ['--enable-unsafe-swiftshader'], args: ['--disable-gpu']` | set | 148 |
| raw `google-chrome --headless=new --disable-gpu` over CDP | set | 10.6 fps screenshots |

Two Playwright defaults each cause it on their own: `--enable-unsafe-swiftshader`,
and the absence of `--disable-gpu`. Removing only one changes nothing, so a
single-flag bisect misses it. The agnt demo engine carries the fix as
`CHROMIUM_LAUNCH_OPTIONS` (`docs-site/screenshots/engine/lib/util.mjs`) with a test
that scans its launch sites. agnt's own browser launcher
(`internal/browser/browser.go`) already runs `--headless=new --disable-gpu` and never
passes the swiftshader flag, so `snapshot` screenshots are unaffected.

Frame-yield check for any recorded take (expect about `fps × seconds`):

```
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 <take>.webm
```
