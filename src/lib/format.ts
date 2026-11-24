/**
 * Formats archive values for display (Spanish conventions).
 */

/** `1993/1995` → `1993–1995`; `1981-06-12` → `12/06/1981`; `1993-05` → `05/1993`. */
export function formatArchiveDate(date: string): string {
  return date
    .split('/')
    .map((part) => part.split('-').reverse().join('/'))
    .join('–');
}

/** Seconds as `m:ss`, or `h:mm:ss` from one hour. */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.round(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

/** A long total in words, rounded to minutes: `34 min`, `2 h 11 min`, `1 h`. */
export function formatTotalDuration(totalSeconds: number): string {
  const minutes = Math.max(Math.round(totalSeconds / 60), 1);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${String(rest)} min`;
  }
  return rest === 0 ? `${String(hours)} h` : `${String(hours)} h ${String(rest)} min`;
}

/** Splits a text body into stanzas, each a list of verses (see `verseBody` in the import). */
export function stanzas(body: string): string[][] {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map((stanza) => stanza.split('\n').map((verse) => verse.trimEnd()))
    .filter((stanza) => stanza.some((verse) => verse !== ''));
}
