import { defineConfig, devices } from '@playwright/test';

const PORT = 4329;

/**
 * E2E tests run against a static build of the fixture content (tests/fixtures/content),
 * never the real content, so results do not depend on what editors change (RT-50).
 */
export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `npm run build:e2e && npx astro preview --outDir dist-e2e --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Astro moves `astro preview` to the background when it detects an AI coding agent;
    // Playwright needs it in the foreground. `0` is Astro's documented opt-out.
    env: { ASTRO_PREVIEW_BACKGROUND: '0' },
  },
});
