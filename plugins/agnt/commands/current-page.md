---
description: "Get comprehensive information about the current page the user is browsing"
allowed-tools: ["mcp__agnt__proxy", "mcp__agnt__proxylog", "mcp__agnt__get_errors"]
---

Get comprehensive information about the current browser page via agnt's browser integration.

## Steps

1. Check for errors first:
   ```
   get_errors {proxy_id: "dev", include_warnings: false}
   ```

2. Get page basics (URL, title, viewport, scroll):
   ```
   proxy {action: "exec", id: "dev", code: "({ url: window.location.href, title: document.title, viewport: { width: window.innerWidth, height: window.innerHeight, scrollX: window.scrollX, scrollY: window.scrollY } })"}
   ```

3. Extract page content as markdown:
   ```
   proxy {action: "exec", id: "dev", code: "__devtool_content.extractContent()"}
   ```
   Returns: `url`, `title`, `markdown`, `meta`, `headings`, `wordCount`.

4. Get navigation structure:
   ```
   proxy {action: "exec", id: "dev", code: "__devtool_content.extractNavigation()"}
   ```

5. For links, structured data, performance, screenshots, or wireframes — refer to the **current-page** skill for detailed usage.

Summarize what the user is viewing based on the page content, URL, and headings.
