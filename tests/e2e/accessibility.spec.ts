import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/** WCAG 2.2 AA (RF-56, RT-42): no automatically detectable violations on key pages. */
const PAGES = ['/', '/sangre-y-sueno/', '/sangre-y-sueno/cordillera-real/'];

for (const path of PAGES) {
  test(`${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
