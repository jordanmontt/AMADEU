import { expect, test } from './support/test';

/**
 * E2E tests never reach outside services (RT-50): the proxy in playwright.config.ts makes
 * every host but the test server unreachable from the browser.
 */
test('outside hosts are unreachable from the browser, the test server is not (RT-50)', async ({
  page,
}) => {
  await page.goto('/');

  const outside = await page.evaluate(async () => {
    try {
      await fetch('https://example.com/', { mode: 'no-cors' });
      return 'reached';
    } catch {
      return 'blocked';
    }
  });

  expect(outside).toBe('blocked');
  expect((await page.request.get('/')).status()).toBe(200);
});
