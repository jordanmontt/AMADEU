/**
 * Astro types JSX elements as `HTMLElement | any` to support other JSX frameworks. This
 * project uses none, so narrow it to `HTMLElement` to keep type-aware linting effective in
 * `.astro` files (fix documented by eslint-plugin-astro, "Unsafe return of an any typed value").
 */
import 'astro/astro-jsx';

declare global {
  namespace JSX {
    type Element = HTMLElement;
  }
}
