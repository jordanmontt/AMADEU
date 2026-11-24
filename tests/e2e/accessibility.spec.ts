import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './support/test';

/** WCAG 2.2 AA (RF-56, RT-42): no automatically detectable violations on key pages. */
const PAGES = [
  '/',
  '/obras/',
  '/sangre-y-sueno/',
  '/sangre-y-sueno/cordillera-real/',
  '/sangre-y-sueno/luna-andina/',
  '/sangre-y-sueno/alcalde-de-la-cancion/',
  '/escuchar/',
  '/galeria/',
  '/galeria/dibujo-prueba/',
  '/galeria/dibujo-93/',
  '/leer/',
  '/videos/',
  '/marcelo/',
  '/buscar/',
];

for (const path of PAGES) {
  test(`${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
