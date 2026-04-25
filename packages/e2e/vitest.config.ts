import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Each smoke case may spawn a child server and finish a roundtrip;
    // 30s gives generous headroom around the 10s per-case spec budget.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Single-threaded: child-process spawn pressure is unfriendly to parallelism
    // and we want predictable cleanup. The full suite is < 10s anyway.
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
