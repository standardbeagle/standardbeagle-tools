import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default ts.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'docs/**',
      '**/docs-api/**',
      'plugins/**',
      '.dartai/**',
      '.workflow/**',
      '.claude/**',
      '.superpowers/**',
      '**/coverage/**',
      '*.min.js',
    ],
  },
  js.configs.recommended,
  ts.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'writable',
        require: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
  },
);
