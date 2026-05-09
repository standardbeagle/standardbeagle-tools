---
name: agnt-lci-companion
description: "Use when agnt installed and user needs semantic code search, symbol lookup, or call-hierarchy analysis — points at sibling lci plugin. agnt配套：導向lci。 Use when: find symbol definition, semantic code search, explore codebase, trace call hierarchy, repeated grep on large repo"
---

# LCI — agnt之代碼智能配套

agnt司瀏覽器與進程控制。**讀解代碼**——符號定義、引用、調用圖、架構探索——用同門之 **lci** 插件（Lightning Code Index）。

## 何時用lci而非agnt

- "Where is `foo` defined?" → lci `search` / `code-context`
- "What calls this function?" → lci `code-context` (call hierarchy)
- "How does this codebase fit together?" → lci `explore`
- 凡需反覆 `Grep` 之中大型倉庫皆用lci

LCI溫索引下通常**亞毫秒**，相比Grep探索削減上下文用量約80%，長代理回合尤為重要。

## 安裝

LCI與agnt同在 `standardbeagle-tools` 市場：

```
claude mcp add lci --source ./plugins/lci
```

或與agnt並行從市場安裝。兩插件設計共存——無鉤子衝突，無MCP服務器衝突。

## 會話中典型分工

| 任務 | 插件 |
|---|---|
| Start dev server, reverse proxy, watch browser errors | **agnt** |
| Find where a React component is defined | **lci** |
| Screenshot + a11y audit of a rendered page | **agnt** |
| Trace what calls `processPayment()` across the repo | **lci** |
| Run `qa-test` / `audit-security` on the running app | **agnt** |
| `explore-codebase` before implementing a feature | **lci** |

在agnt驅動之會話中若反覆Grep，即為引入lci之訊號。
