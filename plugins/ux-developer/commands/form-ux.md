---
name: form-ux
description: Design or review forms with UX best practices for usability, accessibility, and conversion. 設計或審查表單UX：標籤、驗證、無障礙清單、agnt實時檢查。 Use when: building new forms, auditing existing form UX, improving conversion.
---

# Form UX Command

設計新表單或審查現有表單以達到最佳用戶體驗。

## Process

### 1. Understand Form Purpose

收集上下文：
- 我們收集哪些數據，為何收集？
- 用戶完成的動機是什麼？
- 放棄的代價是什麼？
- 需要哪些驗證？

### 2. Form UX Principles

#### Reduce Friction
- 只收集必要信息
- 移除可選字段或漸進化
- 使用智能默認值
- 用適當屬性啟用自動填充

#### Provide Clarity
- 字段上方清晰簡潔的標籤
- 有幫助的佔位符文字（非標籤）
- 複雜字段的行內說明
- 必填字段指示（星號+說明）

#### Give Feedback
- 失焦時行內驗證
- 含解決方案的清晰錯誤消息
- 成功確認
- 長表單的進度指示

#### Enable Recovery
- 驗證錯誤時保留數據
- 清晰的錯誤修復路徑
- 長表單自動保存
- 返回導航不丟失數據

### 3. Form Accessibility Checklist

#### Labels and Instructions
- [ ] Every input has a visible `<label>` with `for` attribute
- [ ] Required fields marked with asterisk AND explained in legend
- [ ] Complex fields have `aria-describedby` pointing to help text
- [ ] Fieldsets used to group related fields with `<legend>`

#### Input Types
- [ ] Correct `type` attribute (email, tel, url, number, date)
- [ ] `autocomplete` attributes for common fields
- [ ] `inputmode` for mobile keyboard optimization
- [ ] `pattern` with `title` for format requirements

#### Error Handling
- [ ] Errors associated with fields via `aria-describedby`
- [ ] Error summary at top with links to fields
- [ ] `aria-invalid="true"` on fields with errors
- [ ] `aria-live` region for dynamic error messages

#### Keyboard & Focus
- [ ] Logical tab order
- [ ] Focus moved to first error on submit
- [ ] No keyboard traps in custom controls
- [ ] Submit button clearly identified

### 4. Form Design Template

```markdown
## [Form Name] Specification

### Purpose
[What data we're collecting and why]

### User Context
- When do they encounter this form?
- What's their motivation level?
- What information do they have available?

### Fields

| Field | Type | Required | Validation | Autofill | Notes |
|-------|------|----------|------------|----------|-------|
| Email | email | Yes | Valid format | email | Primary identifier |
| Phone | tel | No | 10+ digits | tel | For account recovery |

### Field Details

#### [Field Name]
- **Label**: [Exact label text]
- **Placeholder**: [Placeholder if any]
- **Help text**: [Instructional text]
- **Error messages**:
  - Required: "[Field] is required"
  - Invalid: "[Specific format guidance]"
- **Autofill**: `autocomplete="[value]"`

### Validation Strategy
- **When**: On blur for individual fields, on submit for form
- **How**: Inline errors below fields
- **Error summary**: Yes, at top, with anchor links

### Submit Behavior
- **Button text**: [Active verb, e.g., "Create Account"]
- **Loading state**: Button disabled with spinner
- **Success**: [Redirect/message/next step]
- **Error**: [Error handling approach]

### Multi-step (if applicable)
- Step 1: [Fields and purpose]
- Step 2: [Fields and purpose]
- Progress indicator: [Style]
- Save progress: [Yes/No, how]
```

### 5. Review Existing Form

使用agnt代理：

```
// Start proxy for the target URL
proxy {action: "start", id: "form-review", target_url: "<URL>"}

// Capture form structure
proxy {action: "exec", id: "form-review", code: "__devtool.inspect('form')"}

// Check accessibility
proxy {action: "exec", id: "form-review", code: "__devtool.auditAccessibility()"}

// Check for errors
get_errors {proxy_id: "form-review"}
```

評估：
1. **Field audit**: 列出所有字段，哪些不必要？
2. **Label check**: 每個字段是否有適當標籤？
3. **Validation check**: 嘗試無效輸入，檢查錯誤消息
4. **Keyboard test**: 用Tab鍵遍歷整個表單
5. **Autofill test**: 瀏覽器自動填充是否有效？

### 6. Common Form Patterns

#### Login Form
```html
<form>
  <label for="email">Email</label>
  <input type="email" id="email" autocomplete="username" required>

  <label for="password">Password</label>
  <input type="password" id="password" autocomplete="current-password" required>

  <button type="submit">Sign In</button>
</form>
```

#### Registration Form
```html
<form>
  <label for="email">Email</label>
  <input type="email" id="email" autocomplete="email" required>

  <label for="new-password">Create Password</label>
  <input type="password" id="new-password" autocomplete="new-password"
         aria-describedby="password-requirements" required>
  <p id="password-requirements">At least 8 characters with a number</p>

  <button type="submit">Create Account</button>
</form>
```

#### Address Form
```html
<fieldset>
  <legend>Shipping Address</legend>

  <label for="street">Street Address</label>
  <input type="text" id="street" autocomplete="street-address" required>

  <label for="city">City</label>
  <input type="text" id="city" autocomplete="address-level2" required>

  <label for="state">State</label>
  <select id="state" autocomplete="address-level1" required>...</select>

  <label for="zip">ZIP Code</label>
  <input type="text" id="zip" autocomplete="postal-code"
         inputmode="numeric" pattern="[0-9]{5}" required>
</fieldset>
```

### 7. Form Testing Checklist

發布前：

- [ ] Complete form with keyboard only
- [ ] Test with screen reader
- [ ] Trigger every validation error
- [ ] Test autofill with browser
- [ ] Test on mobile device
- [ ] Test with slow network (loading states)
- [ ] Test session timeout handling
- [ ] Test back/forward navigation
- [ ] Verify data reaches backend correctly

### 8. Optimization Recommendations

審查後建議：
- 可移除或設為可選的字段
- 更好的輸入類型
- 需添加的自動填充屬性
- 錯誤消息改進
- 驗證時機調整
- 移動端特定增強
