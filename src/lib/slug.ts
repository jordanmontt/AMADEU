/**
 * Turns a Spanish title into a URL slug: `Sangre y Sueño` → `sangre-y-sueno`.
 *
 * Accents and the tilde are removed, punctuation becomes a separator, and the result is
 * lowercase kebab-case. A title made only of punctuation gives an empty slug; the content
 * integrity checks report that case.
 */
export function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
