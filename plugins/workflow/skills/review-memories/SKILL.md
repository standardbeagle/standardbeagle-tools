---
name: workflow-review-memories
description: "\"Search, review, and manage workflow memories — patterns, decisions, lessons, strategies. 搜索、審查、管理工作流記憶：模式、決策、教訓、策略. Use when: review workflow memories, search saved lessons, apply memory to task, find past decisions, manage memory health\""
disable-model-invocation: true
argument-hint: "\"[search-query]\""
---

# Review Workflow Memories

搜索、審查並管理從先前工作流循環保存的記憶。

## Purpose 目的

記憶保存工作流執行中的寶貴學習：
- 有效的模式
- 含理由的技術決策
- 安全教訓
- 驗證策略
- 代碼模式與慣例

此命令幫助：
- 搜索現有記憶
- 審查已學習的內容
- 將學習應用於當前工作
- 更新或移除過時記憶
- 導出記憶以共享

## Usage 使用方法

### Search All Memories 搜索所有記憶

```bash
/workflow:review-memories
```

Shows all memories organized by category.

### Search by Query 按查詢搜索

```bash
/workflow:review-memories authentication

/workflow:review-memories "rate limiting"

/workflow:review-memories security xss
```

搜索記憶標題、標籤與內容。

### Search by Category 按分類搜索

```bash
/workflow:review-memories --category=workflow_pattern

/workflow:review-memories --category=lesson
```

### Search by Scope 按範圍搜索

```bash
/workflow:review-memories --scope=project

/workflow:review-memories --scope=user
```

### Search by Tags 按標籤搜索

```bash
/workflow:review-memories --tags=security,authentication

/workflow:review-memories --tags=xss
```

## Process 過程

### 1. Load Memories 加載記憶

**來自 slop-mcp**（若可用）：
```bash
# Use slop-mcp to fetch memories
slop-mcp memory list --scope=project
slop-mcp memory list --scope=user
```

**來自本地存儲**（備用）：
```bash
# Read from .workflow/memories/
ls -1 .workflow/memories/*.md

# Parse YAML frontmatter and content
for file in .workflow/memories/*.md; do
  # Extract metadata and content
done
```

### 2. Filter and Sort 過濾與排序

應用過濾器：
- 查詢匹配（標題、標籤、內容）
- 分類過濾器
- 範圍過濾器
- 標籤過濾器
- 置信度

排序方式：
- 相關性（若提供查詢）
- 日期（最新在前）
- 置信度（高在前）
- 分類（分組）

### 3. Display Results 顯示結果

**摘要視圖：**
```
Workflow Memories
=================
Found 12 memories

Workflow Patterns (4):
  ✓ Auth tasks require rate limiting verification
  ✓ UI tasks benefit from screenshot comparison
  ✓ Database migrations in refactor loop only
  ✓ API errors include correlation ID

Technical Decisions (3):
  ✓ JWT authentication with 24h expiry
  ✓ PostgreSQL over MongoDB for ACID
  ✓ bcrypt cost factor 12 for passwords

Lessons Learned (3):
  ⚠ XSS in user profile - always sanitize
  ⚠ Race condition in payments - use transactions
  ⚠ Memory leak from unclosed connections

Code Patterns (2):
  ✓ API pattern: /api/v1/{resource}/{action}
  ✓ Parameterized queries for SQL injection prevention

To view a memory: /workflow:view-memory <title>
```

**詳細視圖：**

若有具體查詢或僅1-3個結果：
```
Memory: Auth tasks require rate limiting verification
=========================================================
Category: workflow_pattern
Scope: project
Tags: authentication, security, rate-limiting
Confidence: high
Created: 2026-01-14 10:23:15
Source: Task 2

## What
When implementing authentication endpoints, always include rate limiting
in the security verification phase.

## Why
Brute force vulnerabilities discovered in Task 2 could have been prevented
with upfront rate limiting verification.

## When
Apply to all authentication-related tasks:
- Login endpoints
- Password reset
- Registration
- 2FA verification

## How
Checklist for verification phase:
- [ ] Rate limit login endpoint (5 attempts/min/IP)
- [ ] Rate limit password reset (3 attempts/hour/email)
- [ ] Test with concurrent requests
- [ ] Verify 429 responses include Retry-After header

## Evidence
Security loop in Task 2 found brute force vulnerability.
After adding rate limiting, no further vulnerabilities found.

---

Related memories: 2
  - JWT authentication with 24h expiry
  - Rate limiting pattern: 5 attempts/min/IP for auth
```

### 4. Action Menu 操作菜單

顯示記憶後，提供操作：

```yaml
actions:
  view_details: "Show full content of a memory"
  apply_to_task: "Use memory in current task"
  update_memory: "Edit memory content"
  delete_memory: "Remove obsolete memory"
  export_memories: "Export to file for sharing"
  link_memories: "Connect related memories"
```

**交互式：**
```
What would you like to do?
1. View details of a specific memory
2. Apply memory to current task
3. Update a memory
4. Delete a memory
5. Export memories to file
6. Nothing, just browsing
```

## Memory Operations 記憶操作

### View Details 查看詳情

顯示含所有字段的完整記憶：
```bash
/workflow:view-memory "Auth tasks require rate limiting"
```

顯示含元數據的完整內容。

### Apply to Task 應用於任務

將記憶融入當前工作：
```
Applying memory: "Auth tasks require rate limiting"

This memory suggests:
- Add rate limiting to authentication endpoints
- Test with concurrent requests
- Verify 429 responses

Should I:
1. Add this to current task checklist
2. Create a new task for rate limiting
3. Just keep it in mind
```

### Update Memory 更新記憶

修改現有記憶：
```
Update memory: "XSS in user profile"

Current content:
[Shows current memory]

What would you like to change?
1. Update content (new learnings)
2. Add tags
3. Change confidence level
4. Update related memories
5. Cancel
```

保存帶時間戳的更新版本。

### Delete Memory 刪除記憶

移除過時記憶：
```
Delete memory: "Use Redux for state management"

This memory is from 3 months ago.
Has it become obsolete?

1. Yes, delete it (moved to Zustand)
2. No, keep it
3. Archive it (keep but mark obsolete)
```

刪除前確認，可選擇改為存檔。

### Export Memories 導出記憶

生成用於共享的文件：
```
Export memories

Options:
1. Export all memories (12 total)
2. Export by category (choose: workflow_pattern, lesson, etc.)
3. Export by scope (choose: project, user, global)
4. Export search results

Format:
1. Markdown (readable)
2. JSON (structured)
3. YAML (human-friendly structured)

Output:
1. File: .workflow/memories-export-2026-01-14.md
2. Clipboard
3. Display inline
```

## Search Algorithms 搜索算法

### Simple Search (Default) 簡單搜索（默認）

- 在標題、標籤、內容中匹配查詢詞
- 不區分大小寫
- 按相關性排序（匹配數量）

### Tag-Based Search 基於標籤的搜索

- 精確標籤匹配
- 支持多標籤（AND/OR）
- 通過索引快速查找

### Full-Text Search 全文搜索

- 搜索完整內容
- 高亮匹配
- 按相關性排名

### Smart Search 智能搜索

若可用的語義搜索：
- 理解意圖（"show me security issues"）
- 相關詞（搜索 "auth" 找到 "authentication"）
- 同義詞擴展

## Memory Statistics 記憶統計

顯示概覽統計：
```
Memory Statistics
=================
Total memories: 42
By category:
  - Workflow patterns: 12
  - Technical decisions: 8
  - Code patterns: 7
  - Lessons learned: 10
  - Verification strategies: 5

By scope:
  - Project: 28
  - User: 12
  - Global: 2

By confidence:
  - High: 35
  - Medium: 6
  - Low: 1

Most used tags:
  1. security (15 memories)
  2. authentication (12)
  3. testing (10)
  4. api (8)
  5. database (7)

Recent activity:
  - 3 memories added this week
  - 1 memory updated yesterday
  - 0 memories deleted this month

Oldest memory: 3 months ago
Newest memory: 2 hours ago
```

## Integration with Current Work 與當前工作的集成

### At Task Start 任務開始時

建議相關記憶：
```
Starting task: "Add OAuth2 authentication"

Relevant memories found (3):
  1. JWT authentication with 24h expiry
  2. Auth tasks require rate limiting verification
  3. XSS in user-generated content

Would you like to:
1. Review these memories before starting
2. Apply patterns from memories
3. Continue without reviewing
```

### During Execution 執行中

若記憶適用則提醒：
```
[During security verification phase]

💡 Memory reminder: "Auth tasks require rate limiting verification"

This task involves authentication. Don't forget to:
- [ ] Rate limit login endpoint
- [ ] Test with concurrent requests
- [ ] Verify 429 responses

View full memory: /workflow:view-memory "Auth tasks require rate limiting"
```

### Before Completion 完成前

檢查記憶是否有用：
```
Task completed: "Add OAuth2 authentication"

You referenced memory: "JWT authentication with 24h expiry"

Was this memory helpful?
1. Yes, very helpful (increase confidence)
2. Somewhat helpful
3. Not helpful (needs update?)
4. Memory is now obsolete (archive?)
```

## Memory Maintenance 記憶維護

### Regular Review 定期審查

定期審查記憶：
- 每完成10個任務
- 每月一次
- 項目里程碑時

檢查：
- 過時記憶（更新或存檔）
- 重複記憶（合並）
- 低置信度記憶（驗證或刪除）
- 缺少鏈接（連接相關記憶）

### Memory Health Report 記憶健康報告

```
Memory Health Report
====================
Status: Good

Concerns:
  ⚠ 2 memories not accessed in 3 months (possibly obsolete)
  ⚠ 1 low-confidence memory (needs validation)
  ✓ No duplicate memories detected
  ✓ All memories properly tagged

Recommendations:
  1. Review: "Old database pattern" (3 months old, not used)
  2. Validate: "Experimental caching strategy" (low confidence)
  3. Update: "API versioning" (new v2 API released)
```

## Examples 示例

### Example 1: 搜索安全教訓
```bash
/workflow:review-memories security

Found 5 memories:
  1. XSS in user profile - always sanitize (lesson)
  2. Auth tasks require rate limiting (workflow_pattern)
  3. SQL injection prevention with parameterized queries (code_pattern)
  4. JWT authentication with 24h expiry (technical_decision)
  5. OWASP Top 10 verification checklist (verification)
```

### Example 2: 審查學到的教訓
```bash
/workflow:review-memories --category=lesson

Lessons Learned (10 memories):
  1. XSS in user profile - always sanitize
  2. Race condition in payments - use transactions
  3. Memory leak from unclosed connections
  4. N+1 query problem in user list endpoint
  5. CORS misconfiguration exposed API
  ...
```

### Example 3: 將記憶應用於當前任務
```bash
# Starting task: Add password reset
/workflow:review-memories password

Found 2 relevant memories:
  1. Auth tasks require rate limiting verification
  2. Password reset flow security checklist

Apply "Password reset flow security checklist" to current task?
1. Yes, add to task context
2. View full memory first
3. Skip

[User selects 1]

Applied to task. Checklist added:
  - [ ] Rate limit: 3 attempts/hour/email
  - [ ] Email token expires in 1 hour
  - [ ] One-time use tokens
  - [ ] Log all reset attempts
  - [ ] Verify email ownership
```

## Notes 備注

- 記憶按項目存儲於 `.workflow/memories/`
- 用戶範圍記憶可跨項目共享
- 全局記憶罕見（僅通用模式）
- 定期審查防止記憶臃腫
- 質量重於數量——有選擇性

## Success Criteria 成功標準

記憶審查成功條件：
- ✓ 相關記憶易於查找
- ✓ 學習已應用於當前工作
- ✓ 過時記憶已移除
- ✓ 記憶質量已維護
- ✓ 知識隨時間累積
