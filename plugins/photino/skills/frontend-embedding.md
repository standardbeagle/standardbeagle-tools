---
description: "Frontend embedding pipeline for Photino.NET: Vite build to wwwroot, base path configuration, dev vs production loading, fallback HTML, and .gitignore setup"
---

# Frontend Embedding in Photino.NET

How the frontend build pipeline works: source files flow through Vite, output to `wwwroot/`, get picked up by MSBuild, and embedded in the binary.

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

The critical settings for Photino embedding:

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

Without `base: './'`, Vite generates absolute paths like `/assets/index-abc123.js`. When Photino loads from a `file://` URL or embedded resource, absolute paths resolve to the filesystem root and fail silently.

```html
<!-- base: '/' (default) — BROKEN in Photino -->
<script src="/assets/index-abc123.js"></script>

<!-- base: './' — CORRECT for Photino -->
<script src="./assets/index-abc123.js"></script>
```

## Dev vs Production Loading

### Production Mode (Photino Window)

The AppHost loads the embedded `index.html`:

```csharp
// AppHost.cs
if (devUrl != null)
    _window.Load(new Uri(devUrl));  // Dev: Vite server
else
    _window.Load("wwwroot/index.html");  // Prod: embedded file
```

Photino resolves `wwwroot/index.html` relative to the executable's directory. The `Content` ItemGroup in `.csproj` ensures files are copied there:

```xml
<Content Include="wwwroot\**\*" CopyToOutputDirectory="PreserveNewest" />
```

### Development Mode (Browser)

In dev mode, the browser loads from Vite at `http://localhost:5173`. The message bridge auto-detects this and uses WebSocket instead of `window.external`:

```typescript
// Auto-detection in message bridge
const isPhotino = !!window.external?.sendMessage;
const transport = isPhotino
  ? new PhotinoTransport()
  : new WebSocketTransport(`ws://${location.host}/ws`);
```

## index.html Template

The entry HTML file must work in both contexts:

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

During initial setup or when the frontend hasn't been built yet, Photino will show a blank page. Add a fallback:

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

The `wwwroot/` directory should be git-ignored since it's a build artifact:

```gitignore
# In src/MyApp/.gitignore
wwwroot/
```

But keep a `.gitkeep` if you want the directory to exist:
```bash
touch src/MyApp/wwwroot/.gitkeep
echo '!wwwroot/.gitkeep' >> src/MyApp/.gitignore
```

**Do NOT gitignore the entire wwwroot pattern globally** — only in the .NET project that receives the Vite build output.

## Static Assets

### Public Directory

Files in the frontend's `public/` directory are copied as-is to wwwroot:

```
src/MyApp.Frontend/
  public/
    favicon.ico        → wwwroot/favicon.ico
    icons/
      app-icon.png     → wwwroot/icons/app-icon.png
```

### Imported Assets

Assets imported in JavaScript/Svelte get hashed filenames:

```svelte
<script>
  import logo from '$lib/assets/logo.svg';
</script>

<img src={logo} alt="Logo" />
<!-- Renders as: <img src="./assets/logo-abc123.svg" /> -->
```

## Frontend Project Structure

Recommended Svelte 5 frontend layout:

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

After building, verify the wwwroot output:

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

Photino apps often produce large bundles because they include rich UI components. The Vite warning at 500KB is informational:

```
(!) Some chunks are larger than 500 kB after minification.
```

This is normal for desktop apps — there's no network download penalty. You can suppress with:

```typescript
build: {
  chunkSizeWarningLimit: 600  // or higher
}
```

For code splitting, use dynamic imports if you want lazy-loaded views:

```svelte
<script>
  const SettingsPanel = import('./components/SettingsPanel.svelte');
</script>

{#await SettingsPanel then module}
  <module.default />
{/await}
```
