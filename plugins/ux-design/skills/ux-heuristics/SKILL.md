---
name: ux-design-ux-heuristics
description: "UX evaluation via Nielsen heuristics, cognitive principles, modern usability patterns. Framework for identifying + resolving usability issues. Nielsen啟發式評估框架。 Use when: conducting UX audit, evaluating interface usability, identifying usability violations, applying cognitive design principles."
disable-model-invocation: true
---

# UX Heuristics & Usability Principles

汝乃UX專家，運用既定可用性啟發式原則與認知原理，助人評估與改進界面設計。

## Philosophy

啟發式原則乃基於經驗的指導方針，無需正式用戶測試即可識別可用性問題。此非規則——乃批判性評估的視角，助於在用戶遭遇問題前發現問題。

## Nielsen's 10 Usability Heuristics

### 1. Visibility of System Status

**Principle**: 通過及時、適當的反饋，使用戶了解系統動態。

**What to Look For**:
- 異步操作的加載指示器
- 多步驟流程的進度條
- 互動元素的選中狀態
- 保存/同步狀態指示器
- 連接狀態（在線/離線）
- 導航中的當前位置

**Signs of Violation**:
- 操作靜默完成
- 用戶疑惑「成功了嗎？」
- 無後台進程指示
- 不清楚何者被選中/激活

**Design Solutions**:
- 交互時的即時視覺反饋（漣漪、色彩變化）
- 帶有意義進度的進度指示器（非僅旋轉）
- 已完成操作的Toast通知
- 頁眉/頁腳中的全局狀態持久顯示

### 2. Match Between System and Real World

**Principle**: 使用用戶熟悉的語言、詞彙和概念。

**What to Look For**:
- 術語符合用戶詞彙
- 圖示使用可識別的隱喻
- 信息按邏輯組織（用戶心智模型）
- 文化適當性

**Signs of Violation**:
- 面向用戶的內容含技術術語
- 陌生的圖示或符號
- 信息結構不符預期
- 錯誤代碼而非解釋

**Design Solutions**:
- 用戶研究了解詞彙
- 圖示識別測試
- 卡片分類用於信息架構
- 簡明語言指南

### 3. User Control and Freedom

**Principle**: 用戶需要清晰標記的「緊急出口」，無需繁瑣對話即可離開非期望狀態。

**What to Look For**:
- 撤銷/重做功能
- 對話框的取消按鈕
- 返回導航始終有效
- 易於逃離死胡同
- 長表單的草稿保存

**Signs of Violation**:
- 無法撤銷操作
- 模態對話框困住用戶
- 瀏覽器返回破壞體驗
- 未經警告丟失工作

**Design Solutions**:
- 帶合理歷史的持久撤銷
- 盡可能使用非模態替代
- 破壞性操作前的確認
- 帶恢復選項的自動保存
- 始終可見的清晰退出點

### 4. Consistency and Standards

**Principle**: 用戶不應懷疑不同詞語、情境或操作是否表示相同含義。

**What to Look For**:
- 同一操作始終外觀相同
- 遵循平台慣例
- 術語全程一致
- 視覺模式適當重複

**Signs of Violation**:
- 按鈕行為不同
- 同一概念術語混用
- 視覺處理不一致
- 無理由打破平台慣例

**Design Solutions**:
- 有文檔模式的設計系統
- 內容風格指南
- UI盤點識別不一致性
- 定期審計漂移

### 5. Error Prevention

**Principle**: 比好的錯誤信息更好的是從一開始就防止錯誤。

**What to Look For**:
- 防止無效輸入的約束
- 後果性操作的確認
- 智能默認值
- 提交前的行內驗證

**Signs of Violation**:
- 錯誤僅在提交後顯示
- 易於選擇錯誤選項
- 破壞性操作過易觸發
- 可能出現無效狀態

**Design Solutions**:
- 輸入掩碼和格式指南
- 不可用選項的禁用狀態
- 破壞性操作的「您確定嗎？」
- 帶清晰反饋的實時驗證
- 預選合理默認值

### 6. Recognition Rather Than Recall

**Principle**: 通過使對象、操作和選項可見，減少記憶負荷。

**What to Look For**:
- 選項可見而非隱藏
- 最近項目可訪問
- 跨屏幕保留情境
- 提供示例和提示

**Signs of Violation**:
- 用戶必須記住代碼或命令
- 重要選項深藏菜單
- 無最近/常用項目
- 空狀態無指導

**Design Solutions**:
- 突顯常用操作
- 最近/收藏項目列表
- 帶建議的搜索
- 提示和情境幫助
- 帶示例的佔位文字

### 7. Flexibility and Efficiency of Use

**Principle**: 加速器——新手看不見——可加快專家的交互速度。

**What to Look For**:
- 鍵盤快捷鍵可用
- 高級用戶功能可訪問
- 定製選項
- 自動化能力

**Signs of Violation**:
- 無鍵盤導航
- 重複用戶被迫走引導流程
- 無法保存偏好
- 重複性任務無快捷方式

**Design Solutions**:
- 漸進式揭示（先簡單，後高級）
- 鍵盤快捷鍵面板
- 可定製儀表板
- 保存的搜索/篩選
- 高級用戶的批量操作

### 8. Aesthetic and Minimalist Design

**Principle**: 對話框不應包含無關或罕用信息。

**What to Look For**:
- 視覺噪音最小化
- 內容按重要性優先
- 複雜內容的漸進式揭示
- 乾淨、專注的界面

**Signs of Violation**:
- 雜亂的屏幕
- 競爭性視覺元素
- 罕用功能突出
- 密集、壓倒性的信息

**Design Solutions**:
- 內容審計（移除不必要的）
- 視覺層次（一個主要操作）
- 次要內容的「顯示更多」
- 留白作為設計元素
- 信息的卡片式分塊

### 9. Help Users Recognize, Diagnose, and Recover from Errors

**Principle**: 錯誤信息應以簡明語言表達，精確指出問題，並建設性地提出解決方案。

**What to Look For**:
- 簡明語言的錯誤信息
- 具體說明出了什麼問題
- 如何修復的指導
- 適時提供幫助鏈接

**Signs of Violation**:
- "Error 500"或技術代碼
- 「出了點問題」無細節
- 無解決路徑
- 錯誤狀態無前進之路

**Design Solutions**:
- 人類可讀的錯誤信息
- 具體問題描述
- 清晰的下一步
- 鄰近原因的行內錯誤位置
- 恢復選項或替代方案

### 10. Help and Documentation

**Principle**: 雖然系統最好無需文檔即可使用，但可能有必要提供幫助。

**What to Look For**:
- 幫助易於訪問
- 複雜功能附近的情境幫助
- 幫助中的搜索功能
- 文檔的漸進式複雜度

**Signs of Violation**:
- 無幫助可用
- 幫助深藏或難以找到
- 過時的文檔
- 無情境指導

**Design Solutions**:
- 複雜功能附近的?圖示
- 不清晰元素的提示
- 新用戶的入職引導
- 情境幫助面板
- 可搜索的知識庫

## Additional Usability Principles

### Fitts's Law

**Principle**: 獲取目標的時間取決於距離和目標大小。

**Design Implications**:
- 重要目標應夠大
- 常用操作靠近預期光標位置
- 邊/角位置更快（無限深度）
- 觸摸目標：最小44x44px

### Hick's Law

**Principle**: 決策時間隨選項數量和複雜性增加。

**Design Implications**:
- 任意視圖中限制選項
- 邏輯分組相關選項
- 使用漸進式揭示
- 提供合理默認值

### Miller's Law

**Principle**: 普通人工作記憶可容納7±2項。

**Design Implications**:
- 將信息分塊組織
- 使用視覺分組
- 限制導航深度
- 勿要求跨屏幕記憶

### Jakob's Law

**Principle**: 用戶大部分時間在其他網站度過，因此期望你的網站以類似方式運作。

**Design Implications**:
- 遵循平台慣例
- 常見功能使用標準模式
- 在增加價值處創新，非為新奇
- 匹配同類產品的心智模型

### Gestalt Principles

**Proximity**: 靠近的元素顯得相關
**Similarity**: 相似元素顯得相關
**Closure**: 心智補全不完整形狀
**Continuity**: 視線沿流暢路徑移動
**Figure/Ground**: 元素被視為前景或背景

### Serial Position Effect

**Principle**: 列表開頭和結尾的項目記憶更佳。

**Design Implications**:
- 重要項目放首尾
- 導航：主頁在開頭，CTA在結尾
- 列表：關鍵項在兩端

### Peak-End Rule

**Principle**: 體驗由峰值時刻和結尾判斷。

**Design Implications**:
- 設計令人難忘的時刻
- 積極結束交互
- 確認屏幕很重要
- 錯誤恢復至關重要（通常是結尾）

## Conducting a Heuristic Evaluation

### Process

1. **Preparation**
   - 收集設計素材（屏幕、流程）
   - 定義範圍（整個產品或特定流程）
   - 識別要評估的用戶場景

2. **Individual Review**
   - 每個評估者獨立審查
   - 遍歷用戶場景
   - 記錄發現的每個問題

3. **Issue Documentation**
   每個問題記錄：
   - 屏幕/位置
   - 違反的啟發式原則
   - 嚴重性等級
   - 描述
   - 建議

4. **Consolidation**
   - 合併評估者發現
   - 刪除重複
   - 按嚴重性優先排序

### Severity Scale

```
0 - Not a usability problem
1 - Cosmetic: Fix if time permits
2 - Minor: Low priority to fix
3 - Major: High priority to fix
4 - Catastrophe: Must fix before release
```

### Prioritization Matrix

```
           | Low Frequency | High Frequency |
-----------+---------------+----------------|
High Impact| 3 (Major)     | 4 (Critical)   |
Low Impact | 1 (Cosmetic)  | 2 (Minor)      |
```

## Evaluation Templates

### Quick Check (Per Screen)

```
Screen: _______________
User Goal: _______________

[ ] System status visible
[ ] Language matches users
[ ] Easy exit/undo available
[ ] Consistent with rest of product
[ ] Errors prevented where possible
[ ] Recognition over recall
[ ] Efficient for repeat use
[ ] Design is minimal/focused
[ ] Error handling is helpful
[ ] Help available if needed
```

### Issue Log

```
ID:        ___
Screen:    ___
Heuristic: ___
Severity:  [ ] 1  [ ] 2  [ ] 3  [ ] 4
Description:
_______________

Recommendation:
_______________
```

## Red Flags by Component Type

### Forms
- 無行內驗證
- 任何驗證前即提交
- 必填字段不清晰
- 無錯誤恢復路徑

### Navigation
- 當前位置不明確
- 可能出現死胡同
- 返回按鈕失效
- 重要項目隱藏

### Tables/Lists
- 無排序/篩選
- 分頁破壞情境
- 行選擇不清晰
- 操作懸停後才顯示

### Modals/Dialogs
- 無清晰退出
- 破壞性操作突出
- 內容需滾動
- 阻擋必要情境

### Empty States
- 無指導提供
- 看起來像損壞/加載中
- 無內容創建路徑

## Modern Additions to Heuristics

### Mobile-Specific

- 拇指區域優化
- 觸摸目標尺寸
- 離線能力
- 最少輸入要求

### Accessibility Additions

- 屏幕閱讀器體驗
- 僅鍵盤導航
- 色彩獨立性
- 動效減少選項

> Invoke the `Skill` tool with `skill: ux-design:accessibility` — 深入無障礙設計準則。

### Performance Perception

- 骨架屏優於旋轉圖
- 樂觀UI更新
- 漸進式內容加載
- 性能即用戶體驗

## Resources

### Nielsen Norman Group
- nngroup.com/articles/ten-usability-heuristics/
- nngroup.com/articles/usability-101-introduction-to-usability/

### Laws of UX
- lawsofux.com - Visual cards of UX principles

### Cognitive Biases in UX
- growth.design/psychology - Interactive examples
