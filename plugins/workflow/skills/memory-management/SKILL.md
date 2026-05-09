---
name: workflow-memory-management
description: "Preserve workflow learnings as structured memories before context compaction fires. 壓縮前保存工作流知識，結構化存儲，供日後檢索. Use when: save workflow memory, preserve lesson learned, review before compaction, store technical decision, manage memory lifecycle"
disable-model-invocation: true
---

# Memory Management for Workflow Loops

上下文壓縮前，保存工作流執行中之寶貴學習與模式。

## Why Memory Management Matters 記憶管理之重要

```yaml
problem:
  context_compaction: "Valuable context gets compressed or lost"
  forgotten_learnings: "Patterns discovered are forgotten"
  repeated_mistakes: "Same issues found multiple times"
  lost_decisions: "Architecture rationale disappears"

solution:
  proactive_preservation: "Save memories before compaction"
  structured_storage: "Organize by category and scope"
  future_retrieval: "Tag for easy search"
  continuous_learning: "Build knowledge base over time"
```

## Memory Categories 記憶分類

### 1. Workflow Patterns 工作流模式

**何物：** 循環中發現的成功執行策略

**示例：**
- "認證任務，安全驗證中必含速率限制"
- "UI任務受益於並行驗證器+截圖比較"
- "數據庫遷移應在重構循環中運行，非質量循環"

**何時保存：**
- 模式反覆有效
- 發現更佳方法
- 規避常見陷阱

**範圍：** 通常 `project` 或 `user`

### 2. Technical Decisions 技術決策

**何物：** 含理由的架構選擇

**示例：**
- "使用24小時過期的JWT認證——理由：微服務的無狀態認證"
- "選PostgreSQL而非MongoDB——理由：金融數據需ACID"
- "使用bcrypt cost factor 12——OWASP建議"

**何時保存：**
- 重大架構決策形成
- 有特定理由的技術選型
- 安全相關配置

**範圍：** 通常 `project`

### 3. Code Patterns 代碼模式

**何物：** 項目特定的編碼慣例與模式

**示例：**
- "API端點遵循模式：/api/v1/{resource}/{action}"
- "所有數據庫查詢使用參數化查詢（防SQL注入）"
- "錯誤響應包含correlation ID用於調試"

**何時保存：**
- 一致模式浮現
- 慣例確立
- 模式防止錯誤

**範圍：** `project`（跨項目偏好時少用 `user`）

### 4. Verification Strategies 驗證策略

**何物：** 發現的有效驗證方法

**示例：**
- "突變測試在auth模塊發現3個弱測試"
- "對抗XSS測試應包括存儲型、反射型和DOM型"
- "邊緣情況測試：總是檢查null、空、最大值"

**何時保存：**
- 驗證方法被證明有價值
- 發現邊緣情況模式
- 測試策略有效

**範圍：** `user`（跨項目適用）

### 5. Lessons Learned 教訓

**何物：** 失敗、漏洞與洞見

**示例：**
- "用戶資料發現XSS——教訓：始終淨化HTML，即使來自已認證用戶"
- "支付處理中的競爭條件——教訓：使用數據庫事務"
- "未關閉連接導致內存洩漏——教訓：始終使用try-finally"

**何時保存：**
- 發現並修復了錯誤
- 發現漏洞
- 犯錯並糾正

**範圍：** 視具體程度為 `user` 或 `project`

## Memory Structure 記憶結構

### Standard Format 標準格式

```yaml
title: "Brief descriptive title (max 60 chars)"
category: "workflow_pattern|technical_decision|code_pattern|verification|lesson"
scope: "project|user|global"
created: "ISO timestamp"
updated: "ISO timestamp (if modified)"
confidence: "high|medium|low"
tags: ["tag1", "tag2", "tag3"]
source: "task-id or context"
related: ["memory-id-1", "memory-id-2"]

content: |
  ## What
  Clear description of the pattern/decision/lesson

  ## Why
  Rationale, context, motivation

  ## When
  When to apply this (conditions, triggers)

  ## How
  Implementation details, steps, code examples

  ## Evidence
  What validated this (test results, metrics, incidents)

  ## Caveats
  When NOT to use, exceptions, edge cases
```

### Minimal Format 簡式格式

快速記憶用：
```yaml
title: "Brief title"
category: "category"
scope: "scope"
tags: ["tags"]
content: "Concise description with key points"
```

## Memory Lifecycle 記憶生命週期

### 1. Identification (PreCompact Hook) 識別

**觸發：** 上下文壓縮即將發生

**過程：**
1. 分析工作流狀態（已完成/失敗任務）
2. 審查對話中的模式
3. 識別有價值的知識
4. 生成3-5個具體建議

**有價值記憶的標準：**
```yaml
include:
  - Specific and actionable (not generic)
  - Project or user relevant (not universal truths)
  - Discovered through work (not pre-existing knowledge)
  - Useful for future tasks (saves time/prevents bugs)

exclude:
  - Generic advice ("write good code")
  - Common knowledge ("use version control")
  - One-time facts (unless pattern)
  - Obvious information
```

### 2. Review and Approval 審查與批准

**用戶交互：**
- 清晰呈現建議
- 允許保存前編輯
- 支持批量批准/拒絕
- 提供保存格式預覽

**每條記憶的選項：**
- ✓ 原樣保存
- ✏️ 編輯後保存
- ⏭️ 跳過此記憶
- ⏭️⏭️ 跳過全部並繼續

### 3. Storage 存儲

**位置：**
```
.workflow/memories/
├── 2026-01-14-auth-rate-limiting.md
├── 2026-01-14-jwt-architecture.md
├── 2026-01-14-xss-lesson.md
└── index.json                        # Searchable index
```

**格式：** 含YAML前置元數據的Markdown

**索引：** 用於快速搜索的JSON文件

### 4. Retrieval 檢索

**何時檢索：**
- 啟動新工作流循環
- 開始類似任務
- 用戶提出相關問題
- 任務描述模式匹配

**搜索方法：**
- 按分類
- 按標籤
- 按範圍（project/user/global）
- 按置信度
- 內容全文搜索

### 5. Update and Refinement 更新與完善

**更新觸發：**
- 記憶被證明有誤（更正）
- 記憶演化（添加新學習）
- 記憶過時（存檔或刪除）

**版本控制：** 保留變更歷史

## Integration with slop-mcp 與 slop-mcp 集成

### Storage in slop-mcp 存儲於 slop-mcp

若 slop-mcp 記憶工具可用：

```bash
# Save memory using slop-mcp
slop-mcp memory save \
  --title "Auth tasks require rate limiting" \
  --category "workflow_pattern" \
  --scope "project" \
  --tags "auth,security,rate-limiting" \
  --content "$(cat memory-content.md)"

# Search memories
slop-mcp memory search --tags "auth,security"

# Retrieve memory
slop-mcp memory get --id "memory-123"

# Update memory
slop-mcp memory update --id "memory-123" --content "Updated content"
```

### Fallback Storage 備用存儲

若 slop-mcp 不可用：
- 存儲於 `.workflow/memories/` 作為 markdown 文件
- 維護 JSON 索引用於搜索
- 通過 Read 工具手動檢索

## PreCompact Hook Flow 預壓縮鉤子流程

```yaml
hook_execution:
  trigger: "PreCompact event fires"

  step_1_generate_prompt:
    script: "suggest-memories.sh"
    output: "Prompt with instructions and context"

  step_2_analyze:
    agent: "Primary agent (you)"
    task: |
      1. Read workflow state file
      2. Identify patterns from recent tasks
      3. Generate 3-5 specific memory suggestions

  step_3_present:
    tool: "AskUserQuestion"
    format: "Multiple choice per memory"
    options: ["Save", "Edit", "Skip", "Skip All"]

  step_4_save:
    approved_memories: "Save to .workflow/memories/ or slop-mcp"
    edited_memories: "Present edit interface, then save"
    skipped_memories: "Discard"

  step_5_confirm:
    message: "Saved N memories before compaction"
    details: "List titles of saved memories"

  step_6_continue:
    action: "Allow compaction to proceed"
```

## Example Workflow 示例工作流

### Scenario: 3個任務完成後

**任務1：** 實現JWT認證
**任務2：** 添加速率限制
**任務3：** 修復XSS漏洞

**PreCompact Hook 觸發：**

**記憶建議1：**
```yaml
title: "JWT auth with 24h expiry for this project"
category: technical_decision
scope: project
tags: [authentication, jwt, architecture]
confidence: high
content: |
  Decided to use JWT authentication with 24-hour token expiry.

  Rationale: Stateless auth suitable for our microservices architecture.
  Balance between UX (don't re-login too often) and security.

  Implementation: auth.ts with jsonwebtoken library
  Refresh tokens: Stored in httpOnly cookies
  Secret: From environment variable (not hardcoded)

  Verified in Task 1 security loop - no vulnerabilities found.
```

**記憶建議2：**
```yaml
title: "Rate limiting pattern: 5 attempts/min/IP for auth"
category: workflow_pattern
scope: project
tags: [rate-limiting, security, authentication]
confidence: high
content: |
  Standard rate limiting for authentication endpoints:
  - Login: 5 attempts per minute per IP
  - Password reset: 3 attempts per hour per email
  - Registration: 10 per hour per IP

  Implementation: express-rate-limit middleware
  Returns: 429 Too Many Requests with Retry-After header

  Discovered in Task 2 when security loop found brute force vulnerability.
  Now part of standard security verification for auth endpoints.
```

**記憶建議3：**
```yaml
title: "XSS in user-generated content - always sanitize"
category: lesson
scope: user
tags: [security, xss, user-input, sanitization]
confidence: high
content: |
  Critical lesson from Task 3: Found stored XSS in user profile bio.

  Vulnerability: Displayed user HTML without sanitization
  Attack: <script>alert('XSS')</script> in bio field
  Impact: Could steal session tokens

  Fix: DOMPurify.sanitize() on all user-generated content
  Applies to: comments, bios, descriptions, any user text

  Key insight: Never trust user input, even from authenticated users.
  Always sanitize HTML before rendering, even in "safe" contexts.

  Testing: Add XSS test cases to security loop for all UGC features.
```

**用戶審查：**
- 建議1：✓ 原樣保存
- 建議2：✓ 原樣保存
- 建議3：✏️ 編輯（用戶添加項目特定細節）

**結果：** 3條記憶已保存，可供日後檢索

## Best Practices 最佳實踐

### DO 應做：
- ✓ 具體而明確
- ✓ 包含理由與背景
- ✓ 充分標籤以利檢索
- ✓ 設置適當範圍（project/user/global）
- ✓ 包含佐證（何以驗證）
- ✓ 隨演化更新記憶

### DON'T 不應做：
- ✗ 保存泛泛建議（"寫測試"）
- ✗ 保存常識（"使用git"）
- ✗ 過度保存（每個小細節）
- ✗ 保存不足（丟失有價值模式）
- ✗ 重複現有記憶
- ✗ 省略背景與理由

### Memory Quality Checklist:
```yaml
quality_check:
  - [ ] Title clearly describes content
  - [ ] Category and scope appropriate
  - [ ] Tags enable future retrieval
  - [ ] Content includes What, Why, When, How
  - [ ] Specific to this project/user (not generic)
  - [ ] Actionable (can apply in future)
  - [ ] Evidence-based (not speculation)
  - [ ] Non-duplicate (doesn't already exist)
```

## Future Enhancements 未來增強

**可能的改進：**
- 根據任務模式自動建議記憶
- 連接相關記憶（圖結構）
- 任務開始時檢索記憶
- 記憶驗證（測試是否仍適用）
- 記憶分析（最有用的、很少使用的）
- 團隊記憶共享（超出用戶範圍）
- 常見分類的記憶模板

## Usage 使用說明

此技能由 PreCompact 鉤子觸發，引導記憶保存過程。

鉤子系統自動處理記憶建議。
