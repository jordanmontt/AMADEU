/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig lets component tests render .astro files with the Astro Container API.
export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/content/**/*.test.ts', 'tests/scripts/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.test.ts'],
      thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
    },
  },
});
