/**
 * The `test` every E2E spec uses: Playwright's, plus the browser console of each page,
 * attached to the report and printed in the CI log when a test fails, so a failure on a
 * runner we cannot reproduce locally explains itself. (Outside hosts are unreachable in every
 * test: see the proxy in playwright.config.ts.)
 */
import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

export const test = base.extend<{ consoleLog: string[] }>({
  consoleLog: [
    async ({ page }, use, testInfo) => {
      const messages: string[] = [];
      page.on('console', (message) => {
        messages.push(`[${message.type()}] ${message.text()}`);
      });
      page.on('pageerror', (error) => {
        messages.push(`[pageerror] ${error.message}`);
      });
      await use(messages);
      if (testInfo.status !== testInfo.expectedStatus && messages.length > 0) {
        await testInfo.attach('browser console', { body: messages.join('\n') });
        console.log(`Browser console of "${testInfo.title}":\n${messages.join('\n')}`);
      }
    },
    { auto: true },
  ],
});
