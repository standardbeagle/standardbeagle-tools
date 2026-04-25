# 網路研究快取（V15）

分派 `web-researcher` 前檢查 V15 快取時，或分派後將新研究附加至快取時讀取此文。此處行為為條件式——多數調用命中快取或寫入一次後繼續。

## 快取檔案結構

```json
[
  {
    "key": {
      "mode": "repo|elsewhere-software|elsewhere-non-software",
      "focus_hint_normalized": "<小寫、空白摺疊之焦點提示或空字串>",
      "topic_surface_hash": "<用戶提供主題表面之短雜湊>"
    },
    "result": "<web-researcher 輸出之純文字>",
    "ts": "<iso8601>"
  }
]
```

檔案位於 `<scratch-dir>/web-research-cache.json`，其中 `<scratch-dir>` 為 SKILL.md 第一階段中一次解析之絕對 OS 臨時路徑（`"${TMPDIR:-/tmp}/compound-engineering/ce-ideate/<run-id>"`）。勿將未解析之 `${TMPDIR:-/tmp}` 字串傳遞至非 shell 工具；恆用第一階段捕獲之絕對路徑。

## 複用檢查

分派 `web-researcher` 前，以 bash 解析臨時根目錄（`<scratch-dir>` 之父目錄）並列出同層 run-id 目錄——會話內之精煉循環可能合理複用另一運行之按主題快取，非按 run-id：

```bash
SCRATCH_ROOT="${TMPDIR:-/tmp}/compound-engineering/ce-ideate"
find "$SCRATCH_ROOT" -maxdepth 2 -name 'web-research-cache.json' -type f 2>/dev/null
```

無快取檔案時 `find` 以退出碼 0 且輸出為空，故首次運行不會中止複用檢查步驟。

讀取各匹配檔案。若任何條目之 `key` 匹配當前分派（完整模式變體相同——`repo`、`elsewhere-software` 或 `elsewhere-non-software`——加上相同之不區分大小寫正規化焦點提示加上相同之主題表面雜湊），跳過分派並將快取之 `result` 傳遞至合併立基摘要。模式變體須精確匹配：`elsewhere-software` 及 `elsewhere-non-software` 為不同領域，不得跨複用。摘要中註明：「複用本次會話之先前網路研究——說 're-research' 以刷新。」

`re-research` 覆寫時，刪除匹配條目並重新分派。

## 新鮮分派後附加

新鮮分派後，使用第一階段之絕對路徑將新結果附加至當前運行之快取檔案 `<scratch-dir>/web-research-cache.json`（按需建立目錄及檔案）。會話中之下次調用可透過上述 `find` 列表複用之。

## 主題表面雜湊

主題表面為網路研究所立基之用戶提供內容：
- **其他模式（`elsewhere-software`、`elsewhere-non-software`）：** 用戶之主題提示加任何階段 0.4 詢問答案（代理實際研究之主體）。兩個子模式分別鍵值——相同主題雜湊在軟體與非軟體間之重新分類必須觸發新鮮分派，因研究領域不同。
- **倉庫模式：** 焦點提示加穩定倉庫鑑別器。此保持快取鍵在焦點為空時仍有意義——同一倉庫中兩次裸提示調用合理共享研究，但鍵仍區分不同倉庫。由於各倉庫運行之快取檔案現存於共享 OS 臨時根目錄下，裸基本名如 `app` 或 `frontend` 將在不相關倉庫間衝突。以下列回退鏈解析鑑別器並雜湊結果（sha256 前 8 個十六進制字元即足）：
    1. `git remote get-url origin` —— 跨機器穩定，對同一遠端之協作者正確。
    2. `git rev-parse --show-toplevel` —— 絕對倉庫路徑；機器本地但 git checkout 中恆可用。
    3. 當前工作目錄之絕對路徑 —— 不在 git 倉庫中時之最後手段。

雜湊前正規化：小寫、摺疊空白。（倉庫鑑別器雜湊由原始命令輸出計算；僅焦點提示及主題文字經正規化。）

## 退化

若快取檔案在當前平台上跨調用不可達（檔案系統隔離、沙箱、臨時工作目錄），退化為「不複用，每次分派」。於合併立基摘要中呈現限制並繼續，而非虛構平台可能不具備之能力。
