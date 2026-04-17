---
description: "Open sketch mode for wireframing on the browser page. 開繪圖模式於瀏覽頁. Use when: wireframe UI, sketch layout, draw mockup, prototype design, annotate page visually"
allowed-tools: ["mcp__agnt__proxy", "mcp__agnt__proxylog"]
---

開啟草圖模式覆蓋層，直接在瀏覽器頁面上建立線框。

## 步驟

1. 在瀏覽器開啟草圖模式：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.sketch.open()"}
   ```

2. 告知用戶草圖模式已啟動，可用工具如下：
   - **select**：選取並移動元素
   - **rectangle**：繪製矩形
   - **ellipse**：繪製橢圓/圓形
   - **line**：繪製直線
   - **arrow**：繪製箭頭
   - **freedraw**：自由手繪
   - **text**：新增文字標籤
   - **note**：便利貼（Balsamiq風格）
   - **button**：按鈕線框元素
   - **input**：輸入欄位線框
   - **image**：圖片佔位符
   - **eraser**：刪除元素

3. 草圖模式鍵盤快捷鍵：
   - `Escape`：關閉草圖模式
   - `Delete/Backspace`：刪除選取元素
   - `Ctrl+Z`：復原
   - `Ctrl+Shift+Z` 或 `Ctrl+Y`：重做
   - `Ctrl+A`：全選
   - `Ctrl+C`：複製選取
   - `Ctrl+V`：貼上

4. 用戶完成繪製後可：
   - 點擊「Save & Send」儲存草圖並送給代理
   - 或程式化儲存：
     ```
     proxy {action: "exec", id: "dev", code: "__devtool.sketch.save()"}
     ```

5. 取回已儲存草圖：
   ```
   proxylog {proxy_id: "dev", types: ["sketch"], limit: 5}
   ```

注：草圖模式建立Excalidraw式覆蓋層。草圖渲染使用可設定粗糙度，呈現手繪外觀。
