import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['app/tests/**/*.test.ts'],
    setupFiles: ['./app/tests/setup.ts'],
  },
});