import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      'plugins/**',
      'docs/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/dist/**',
        '**/node_modules/**',
        '**/*.config.ts',
        'docs/**',
        'plugins/**',
        'tests/**',
        '.dartai/**',
        '.workflow/**',
        '.claude/**',
        '.superpowers/**',
      ],
    },
  },
});
