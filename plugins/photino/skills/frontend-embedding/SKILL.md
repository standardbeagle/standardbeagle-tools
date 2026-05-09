---
name: photino-frontend-embedding
description: "Frontend embedding pipeline for Photino.NET: Vite build to wwwroot, base path configuration, dev vs production loading, fallback HTML, and .gitignore setup. 前端嵌入管道：Vite構建至wwwroot、基路徑配置、開發/生產加載、後備HTML及.gitignore設置. Use when: configuring Vite for Photino, setting up wwwroot output, troubleshooting asset paths, configuring dev vs prod loading"
disable-model-invocation: true
---

# Frontend Embedding in Photino.NET

前端構建管道工作原理：源文件經Vite、輸出至`wwwroot/`、MSBuild拾取、嵌入二進制。

## Build Pipeline

```
Frontend Source          Vite Build           MSBuild
─────────────────  →  ──────────────  →  ─────────────────
src/App.svelte         wwwroot/            MyApp.exe
src/lib/**             ├─ index.html       (embedded assets)
src/app.css            ├─ assets/
public/                │  ├─ index-[hash].js
                       │  └─ index-[hash].css
                       └─ favicon.ico
```

## Vite Configuration

Photino嵌入關鍵設置：

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],

  // CRITICAL: Use relative paths for embedded loading
  base: './',

  build: {
    // Output directly to the .NET project's wwwroot
    outDir: '../MyApp/wwwroot',
    emptyOutDir: true,

    // Optional: adjust chunk size warning
    chunkSizeWarningLimit: 600
  },

  server: {
    port: 5173,
    proxy: {
      '/ws': {
        target: 'ws://localhost:5174',
        ws: true
      }
    }
  }
});
```

### Why `base: './'` is Required

無`base: './'`，Vite生成絕對路徑如`/assets/index-abc123.js`。Photino從`file://` URL或嵌入資源加載時，絕對路徑解析至文件系統根，靜默失敗。

```html
<!-- base: '/' (default) — BROKEN in Photino -->
<script src="/assets/index-abc123.js"></script>

<!-- base: './' — CORRECT for Photino -->
<script src="./assets/index-abc123.js"></script>
```

## Dev vs Production Loading

### Production Mode (Photino Window)

AppHost加載嵌入的`index.html`：

```csharp
// AppHost.cs
if (devUrl != null)
    _window.Load(new Uri(devUrl));  // Dev: Vite server
else
    _window.Load("wwwroot/index.html");  // Prod: embedded file
```

Photino相對可執行文件目錄解析`wwwroot/index.html`。`.csproj`中`Content` ItemGroup確保文件被複製：

```xml
<Content Include="wwwroot\**\*" CopyToOutputDirectory="PreserveNewest" />
```

### Development Mode (Browser)

開發模式下，瀏覽器從Vite`http://localhost:5173`加載。消息橋自動檢測並使用WebSocket而非`window.external`：

```typescript
// Auto-detection in message bridge
const isPhotino = !!window.external?.sendMessage;
const transport = isPhotino
  ? new PhotinoTransport()
  : new WebSocketTransport(`ws://${location.host}/ws`);
```

## index.html Template

入口HTML文件須兩種上下文均可用：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Photino App</title>
  <!-- All paths relative — works in both file:// and http:// -->
  <link rel="icon" type="image/x-icon" href="./favicon.ico" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./src/main.ts"></script>
</body>
</html>
```

## Fallback HTML for Missing Build

初始設置或前端未構建時，Photino顯示空白頁。添加後備：

```csharp
// In AppHost.cs
var wwwrootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot", "index.html");
if (File.Exists(wwwrootPath))
{
    _window.Load(wwwrootPath);
}
else
{
    // Fallback: show a simple HTML page with build instructions
    _window.LoadRawString(@"
        <html>
        <body style='font-family: system-ui; padding: 40px; background: #1a1a2e; color: #e0e0e0;'>
            <h1>Frontend not built</h1>
            <p>Run the following to build the frontend:</p>
            <pre style='background: #16213e; padding: 16px; border-radius: 8px;'>
cd src/MyApp.Frontend
pnpm install
pnpm build</pre>
            <p>Then restart the application.</p>
        </body>
        </html>
    ");
}
```

## .gitignore Setup

`wwwroot/`目錄為構建產物，應納入git忽略：

```gitignore
# In src/MyApp/.gitignore
wwwroot/
```

若需目錄存在，保留`.gitkeep`：
```bash
touch src/MyApp/wwwroot/.gitkeep
echo '!wwwroot/.gitkeep' >> src/MyApp/.gitignore
```

**勿全局忽略wwwroot模式**——僅在接收Vite構建輸出的.NET工程中忽略。

## Static Assets

### Public Directory

前端`public/`目錄中文件按原樣複製至wwwroot：

```
src/MyApp.Frontend/
  public/
    favicon.ico        → wwwroot/favicon.ico
    icons/
      app-icon.png     → wwwroot/icons/app-icon.png
```

### Imported Assets

JavaScript/Svelte中導入的資產獲哈希文件名：

```svelte
<script>
  import logo from '$lib/assets/logo.svg';
</script>

<img src={logo} alt="Logo" />
<!-- Renders as: <img src="./assets/logo-abc123.svg" /> -->
```

## Frontend Project Structure

推薦Svelte 5前端佈局：

```
src/MyApp.Frontend/
  package.json
  vite.config.ts
  svelte.config.js
  tsconfig.json
  public/
    favicon.ico
  src/
    main.ts                    # Entry point
    App.svelte                 # Root component
    app.css                    # Global styles
    lib/
      stores/
        messages.ts            # Message bridge (send/on/off)
      components/
        Terminal.svelte
        StatusBar.svelte
      types/
        messages.ts            # Message type definitions
```

### main.ts Entry Point

```typescript
import App from './App.svelte';
import { mount } from 'svelte';
import './app.css';

const app = mount(App, {
  target: document.getElementById('app')!
});

export default app;
```

## Build Verification

構建後驗證wwwroot輸出：

```bash
# Build frontend
cd src/MyApp.Frontend && pnpm build

# Verify output
ls -la ../MyApp/wwwroot/
# Should contain: index.html, assets/, favicon.ico

# Verify relative paths in index.html
grep -o 'src="[^"]*"' ../MyApp/wwwroot/index.html
# Should show: src="./assets/index-xxxxx.js"

# Build .NET (picks up wwwroot)
cd ../../ && dotnet build
```

## Chunk Size Considerations

Photino應用因含豐富UI組件常產生大捆包。Vite 500KB警告僅為提示：

```
(!) Some chunks are larger than 500 kB after minification.
```

桌面應用無網絡下載代價，此屬正常。可以此壓制：

```typescript
build: {
  chunkSizeWarningLimit: 600  // or higher
}
```

若需延遲加載視圖，用動態導入拆分代碼：

```svelte
<script>
  const SettingsPanel = import('./components/SettingsPanel.svelte');
</script>

{#await SettingsPanel then module}
  <module.default />
{/await}
```
