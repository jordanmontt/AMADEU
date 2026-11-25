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
    // No network (RT-50): every host but the test server goes through a proxy that does not
    // exist, so requests to outside services fail in the browser itself. Unlike intercepting
    // routes, this leaves the service worker in charge, which the offline tests need.
    proxy: { server: 'http://127.0.0.1:9', bypass: 'localhost,127.0.0.1' },
    trace: 'on-first-retry',
  },
  // Desktop browsers run every test except the phone checks. The phone projects run the
  // phone checks and the main journeys, tagged @phone, on Android and iPhone screens.
  // Firefox has no phone emulation in Playwright.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /phone\.spec\.ts/ },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: /phone\.spec\.ts/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: /phone\.spec\.ts/ },
    { name: 'phone-chromium', use: { ...devices['Pixel 7'] }, grep: /@phone/ },
    { name: 'phone-webkit', use: { ...devices['iPhone 14'] }, grep: /@phone/ },
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
