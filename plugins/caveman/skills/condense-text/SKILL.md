---
name: caveman-condense-text
description: "Compress raw text via caveman-mcp two-pass (filler removal + classical Chinese ultra). Code/identifiers/numbers preserved. 以caveman壓縮任意文本。 Use when: compress chat transcript, condense prose, prep meeting notes, summarize research draft, reduce memory entry size, ad-hoc inline compression"
disable-model-invocation: true
---

# condense_text — Raw Text Compression

對任意文本字符串應用caveman兩階段壓縮。當文本不在URL/文件/git中（如轉錄、會議記錄、內聯草稿），用此。

## When to Use

| Scenario | Action |
|----|----|
| 會議轉錄存memory | `condense_text` |
| 對話日誌摘要 | `condense_text` |
| 研究草稿瘦身 | `condense_text` |
| 已是URL/文件/diff | 用對應專用工具，自動路由更佳 |
| 代碼塊 | 不要——caveman為散文設計 |
| 短文本（<200字） | 直接用，無需壓縮 |

## Access Pattern

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "caveman"
  tool_name: "condense_text"
  parameters:
    text: "<raw-text>"
```

直接：`mcp__plugin_caveman_caveman__condense_text`

## Two-Pass Method

1. **機械過濾** — 去除填充詞（"basically", "actually", "you know"等），保留代碼、數字、標識符、引號內容
2. **LLM超壓縮** — 文言文風格進一步壓縮散文層

技術術語、版本號、API名、文件路徑、錯誤消息維持原樣。

## Examples

### Compress meeting notes
```yaml
tool_name: condense_text
parameters:
  text: |
    So basically we talked about the auth migration and I think
    everyone agreed that we should actually move forward with the
    OIDC approach rather than the SAML one because, you know,
    it's just easier to maintain long-term...
```

### Shrink a long memory entry
存memory前先壓縮：
```yaml
tool_name: condense_text
parameters:
  text: "<long prose memory content>"
```
返回值寫入memory文件，省未來載入token。

### Compress chat transcript
```yaml
tool_name: condense_text
parameters:
  text: |
    User: Can you help me debug this issue with...
    Assistant: Sure, let me look at it. The problem seems to be...
    User: Yeah I tried that already and...
```

## Tips

- **Idempotent-ish**: 已壓縮文本再壓縮收益遞減。一次足
- **Code blocks**: 含代碼的混合文本——caveman保護代碼塊（``` fenced）。但若無fence，標識符仍保留但散文被壓
- **Other languages**: 主要英文優化。中日韓文caveman可能改寫過度——測試後用
- **Preserves quotes**: 引號內容保留逐字，適合保留用戶語錄
- **Quick win**: 任何將進入memory或長期存儲的散文都該過一遍
