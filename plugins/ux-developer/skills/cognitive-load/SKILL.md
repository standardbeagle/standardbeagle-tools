---
name: ux-developer-cognitive-load
description: "Cognitive load reduction strategies for clearer, simpler user experiences. 認知負荷削減策略：選擇精簡、漸進披露、一致模式、智能默認。 Use when: reviewing information architecture, simplifying complex flows, reducing decision points."
disable-model-invocation: true
---

# Reducing Cognitive Load

設計易於理解與使用之界面。

## Cognitive Load Types

### Intrinsic Load
任務本身之固有複雜性。不可消除，但可支撐。

### Extraneous Load
設計不良導致之多餘複雜性。應最小化。

### Germane Load
用於學習與建立理解之心理努力。應優化。

## Strategies

### 1. Reduce Choices

**Miller's Law**: 人類工作記憶可容納7±2項。

```html
<!-- Too many options at once -->
<nav>
  <a href="#">Products</a>
  <a href="#">Services</a>
  <a href="#">Solutions</a>
  <a href="#">Industries</a>
  <a href="#">Resources</a>
  <a href="#">Support</a>
  <a href="#">Company</a>
  <a href="#">Partners</a>
  <a href="#">News</a>
  <a href="#">Contact</a>
</nav>

<!-- Better: Grouped, fewer top-level items -->
<nav>
  <a href="#">Products</a>
  <a href="#">Solutions</a>
  <a href="#">Resources</a>
  <a href="#">Company</a>
  <a href="#">Support</a>
</nav>
```

**Hick's Law**: 選項越多，決策時間越長。

```html
<!-- Overwhelming -->
<select>
  <option>Option 1</option>
  <!-- ... 50 more options ... -->
</select>

<!-- Better: Searchable, categorized -->
<input type="text" role="combobox" placeholder="Search options...">
```

### 2. Progressive Disclosure

僅顯示當前所需，按需展開更多。

```html
<!-- Primary info visible -->
<div class="product-card">
  <h3>Product Name</h3>
  <p class="price">$49.99</p>
  <button>Add to Cart</button>

  <!-- Details on demand -->
  <details>
    <summary>View specifications</summary>
    <dl>
      <dt>Dimensions</dt><dd>10" x 8" x 2"</dd>
      <dt>Weight</dt><dd>1.5 lbs</dd>
      <dt>Material</dt><dd>Aluminum</dd>
    </dl>
  </details>
</div>
```

```html
<!-- Form sections revealed progressively -->
<form>
  <fieldset>
    <legend>1. Account Information</legend>
    <!-- Always visible -->
  </fieldset>

  <fieldset hidden>
    <legend>2. Shipping Address</legend>
    <!-- Revealed after step 1 complete -->
  </fieldset>
</form>
```

### 3. Use Recognition Over Recall

展示選項，無需記憶。

```html
<!-- Bad: Requires remembering syntax -->
<label>Date (MM/DD/YYYY)</label>
<input type="text" placeholder="MM/DD/YYYY">

<!-- Good: Date picker removes recall need -->
<label>Date</label>
<input type="date">

<!-- Good: Recent/saved items -->
<label>Shipping Address</label>
<select>
  <option>Home - 123 Main St, City</option>
  <option>Work - 456 Office Blvd, Town</option>
  <option value="new">+ Add new address</option>
</select>
```

### 4. Group Related Information

**格式塔鄰近原則**：相近者感知為相關。

```html
<!-- Unorganized -->
<form>
  <input placeholder="First name">
  <input placeholder="Email">
  <input placeholder="Last name">
  <input placeholder="Phone">
</form>

<!-- Organized by relationship -->
<form>
  <fieldset>
    <legend>Name</legend>
    <input placeholder="First name">
    <input placeholder="Last name">
  </fieldset>

  <fieldset>
    <legend>Contact</legend>
    <input placeholder="Email">
    <input placeholder="Phone">
  </fieldset>
</form>
```

### 5. Provide Clear Visual Hierarchy

引導注意力至要點。

```css
/* Primary action stands out */
.btn-primary {
  font-size: 1.125rem;
  font-weight: 600;
  padding: 16px 32px;
  background: #0066cc;
  color: white;
}

/* Secondary is subdued */
.btn-secondary {
  font-size: 1rem;
  font-weight: 400;
  padding: 12px 24px;
  background: transparent;
  border: 1px solid #ccc;
}
```

### 6. Use Consistent Patterns

相同模式遍佈各處，降低學習成本。

```css
/* Consistent component styling */
.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 24px;
}

/* Consistent spacing scale */
:root {
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}

/* Consistent interaction patterns */
button:hover {
  transform: translateY(-1px);
}
```

### 7. Reduce Text

少而精。

```html
<!-- Verbose -->
<p>
  In order to complete the registration process, you will need to
  click on the button labeled "Submit" which is located below this
  text, after which you will receive a confirmation email.
</p>

<!-- Concise -->
<p>Click Submit to complete registration. We'll send confirmation to your email.</p>
```

### 8. Smart Defaults

預填合理選擇。

```html
<!-- Pre-selected common option -->
<select>
  <option value="usa" selected>United States</option>
  <option value="canada">Canada</option>
  <!-- ... -->
</select>

<!-- Smart date defaults -->
<input type="date" value="2026-01-10"> <!-- Next week -->

<!-- Based on context -->
<select id="shipping">
  <!-- Pre-select based on user's location or history -->
</select>
```

### 9. Provide Feedback and Status

減少對當前狀態之不確定性。

```html
<!-- Loading state -->
<button disabled aria-busy="true">
  <span class="spinner"></span>
  Saving...
</button>

<!-- Progress indication -->
<progress value="60" max="100">60% complete</progress>

<!-- Confirmation -->
<div role="status" class="toast toast-success">
  Changes saved successfully
</div>
```

### 10. Error Prevention Over Error Handling

防患於未然。

```html
<!-- Constrained input -->
<input type="number" min="1" max="100" step="1">

<!-- Real-time validation -->
<input type="email" pattern="[^@]+@[^@]+\.[^@]+">

<!-- Confirmation for destructive actions -->
<dialog id="confirm-delete">
  <p>Delete "Document.pdf"? This cannot be undone.</p>
  <button>Cancel</button>
  <button class="danger">Delete</button>
</dialog>
```

## Measuring Cognitive Load

### Indicators of High Cognitive Load

- 高錯誤率
- 頻繁回退
- 任務完成時間長
- 支持請求頻繁
- 用戶測試中的困惑
- 低轉化率

### Testing Questions

用戶測試後詢問：
- "On a scale of 1-10, how mentally demanding was this task?"
- "Did you feel overwhelmed at any point?"
- "Was it clear what you needed to do next?"

## Checklist

- [ ] Navigation has 7 or fewer top-level items
- [ ] Forms use progressive disclosure
- [ ] Common options are pre-selected
- [ ] Related items are visually grouped
- [ ] Primary actions are visually prominent
- [ ] Consistent patterns used throughout
- [ ] Text is concise and scannable
- [ ] Feedback provided for all actions
- [ ] Errors prevented where possible
- [ ] Users don't need to remember information
