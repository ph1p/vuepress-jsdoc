import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'example/', 'documentation/', 'public/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: globals.node
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      eqeqeq: ['error', 'smart'],
      'no-console': 'off',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },
  {
    files: ['src/**/__tests__/**'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  }
);
