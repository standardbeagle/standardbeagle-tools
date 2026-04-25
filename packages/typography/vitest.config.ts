import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // harfbuzz-wasm cold-start under concurrent workspace load can exceed
    // vitest's 5s default; 30s gives comfortable headroom without masking
    // real hangs.
    testTimeout: 30000,
  },
});
