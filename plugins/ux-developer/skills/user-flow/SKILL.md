---
name: ux-developer-user-flow
description: "\"Design, document, or analyze user flows with UX best practices and friction identification. 設計或分析用戶流程：映射旅程、識別摩擦、無障礙與移動端考量、agnt測試。 Use when: designing checkout/onboarding flows, finding drop-off points, documenting user paths.\""
disable-model-invocation: true
---

# User Flow Command

設計新用戶流程或分析現有流程以優化UX。

## Process

### 1. Define the Flow

收集流程上下文：
- **Goal**: 用戶試圖完成什麼？
- **Entry points**: 用戶從哪裏進入此流程？
- **Success criteria**: 何為成功完成？
- **User context**: 用戶進入時的狀態與知識？

### 2. Map the Current/Proposed Flow

建立流程圖：

```
[Entry Point]
     ↓
[Step 1: Action]
     ↓
[Decision Point] → [Alternative Path]
     ↓                    ↓
[Step 2: Action]    [Step 2a: Action]
     ↓                    ↓
[Success State]    [Rejoin or End]
```

### 3. Analyze Each Step

逐步評估：

#### Cognitive Load
- 用戶需記憶多少？
- 信息是否在需要時提供？
- 選項是否過多？（目標5–7個）

#### Effort Required
- 點擊/點觸次數
- 需輸入的數據
- 需做的決策

#### Error Potential
- 什麼可能出錯？
- 用戶如何恢復？
- 進度是否已保存？

#### Feedback
- 用戶知道自己在哪裡嗎？
- 進度可見嗎？
- 操作是否已確認？

### 4. Friction Point Analysis

識別並分類摩擦：

| Step | Friction Type | Severity | Issue | Recommendation |
|------|---------------|----------|-------|----------------|
| | Cognitive | High/Med/Low | | |
| | Technical | High/Med/Low | | |
| | Emotional | High/Med/Low | | |
| | Time | High/Med/Low | | |

**Friction Types:**
- **Cognitive**: 混淆、下一步不清晰、選項太多
- **Technical**: 加載慢、錯誤、兼容性問題
- **Emotional**: 焦慮、不信任、挫敗感
- **Time**: 步驟過多、不必要的等待

### 5. Accessibility in Flows

確保流程對所有人可用：

- [ ] 可僅用鍵盤完成整個流程
- [ ] 屏幕閱讀器可導航並理解進度
- [ ] 錯誤消息已公告且可操作
- [ ] 超時寬鬆或可調整
- [ ] 複雜步驟有替代方案（如CAPTCHA替代）
- [ ] 返回導航不丟失進度
- [ ] 驗證錯誤時表單數據保留

### 6. Mobile Flow Considerations

- [ ] 步驟在移動端視口無水平滾動
- [ ] 全程觸控目標充足
- [ ] 使用原生輸入類型（tel, email, date）
- [ ] 適當支持自動填充
- [ ] 移動端相機/文件上傳可用

### 7. Flow Optimization Recommendations

應用以下原則：

#### Reduce Steps
- 合並相關輸入
- 移除可選字段（或漸進化）
- 使用智能默認值
- 啟用自動填充

#### Provide Progress
- 多步驟流程顯示步驟指示器
- 顯示完成百分比
- 允許保存進度

#### Enable Recovery
- 明確的返回/撤銷路徑
- 自動保存狀態
- 含解決方案之有幫助錯誤消息

#### Build Confidence
- 在相關處顯示安全指示
- 提供費用/時間估算
- 最終操作前預覽
- 方便取消

### 8. Generate Flow Documentation

```markdown
# [Flow Name] User Flow

## Overview
- **Purpose**: [What users accomplish]
- **Target users**: [Who uses this]
- **Entry points**: [Where users start]
- **Success metric**: [How we measure success]

## Flow Diagram
[Visual diagram]

## Step-by-Step Breakdown

### Step 1: [Name]
- **User action**: [What they do]
- **System response**: [What happens]
- **Required data**: [What we need]
- **Validation**: [Rules applied]
- **Error handling**: [What if it fails]
- **Accessibility**: [A11y considerations]

[Repeat for each step]

## Edge Cases
| Scenario | Handling |
|----------|----------|
| User abandons mid-flow | [Save state for 30 days] |
| Validation error | [Inline, preserve data] |
| Session timeout | [Warn at 5min, save state] |

## Metrics to Track
- Completion rate
- Drop-off by step
- Time to complete
- Error rate by step

## Testing Checklist
- [ ] Complete flow with keyboard only
- [ ] Complete flow with screen reader
- [ ] Complete flow on mobile
- [ ] Test all error scenarios
- [ ] Test session timeout handling
- [ ] Test back button behavior
```

### 9. Testing with agnt

對現有流程：
```
1. proxy {action: "start", id: "user-flow", target_url: "<URL>"}
2. automation {action: "start", proxy_id: "user-flow"} then automation {action: "screenshot", session_id: "<id>", type: "viewport"} at each step
3. currentpage {proxy_id: "user-flow", action: "summary"} to analyze each step
4. get_incidents {proxy_id: "user-flow"} to check for JavaScript errors at each step
5. proxylog {proxy_id: "user-flow", action: "summary"} to check for failed requests
```

### 10. Implementation Tracking

提供為以下創建項目追蹤任務：
- 每個需要UX改進的步驟
- 需要的無障礙修復
- 性能優化
- A/B測試設置
