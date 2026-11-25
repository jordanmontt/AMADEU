/**
 * Every functional requirement (docs/01-requerimientos-funcionales.md) is either checked by
 * at least one test that names it, e.g. "shows the critical notes (RF-21)", or listed below
 * as not checked yet, with the reason. A requirement in neither place fails this test, so
 * none can be forgotten; one listed below that a test now names fails too, so the list
 * stays true.
 */
import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** Requirements no test checks yet, and why. Remove an entry when a test names it. */
const NOT_CHECKED_YET: Readonly<Record<string, string>> = {
  'RF-11': 'H5b: animated drawing and La Paz on the home page (needs design decisions)',
  'RF-34': 'H5b: photographs of Marcelo in the biography (needs the photos and their rights)',
  'RF-45': 'design tone: reviewed by eye; visual tests postponed until after v1',
  'RF-46': 'design tone: reviewed by eye; visual tests postponed until after v1',
  'RF-55': 'Spanish only, every string in src/i18n/es.ts: enforced by code review',
  'RF-62': 'H7: analytics without cookies',
  'RF-65': 'H6: admin panel',
  'RF-66': 'H6: admin panel',
  'RF-67': 'H6: admin panel',
  'RF-68': 'H6: admin panel',
  'RF-69': 'H6: admin panel',
  'RF-70': 'H6: admin panel',
  'RF-80': 'Android app, after v1',
  'RF-81': 'Android app, after v1',
  'RF-82': 'Android app, after v1',
};

function requirements(): string[] {
  const document = readFileSync('docs/01-requerimientos-funcionales.md', 'utf8');
  return [...document.matchAll(/\*\*(RF-\d+)\.\*\*/g)].map(([, id]) => id ?? '');
}

/** Requirements named inside a string of a test file: the titles of its tests. */
function requirementsNamedByTests(): Set<string> {
  const files = globSync(['src/**/*.test.ts', 'tests/**/*.{test,spec}.ts']).filter(
    (file) => !file.startsWith('tests/requirements/'),
  );
  const named = new Set<string>();
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const [literal] of source.matchAll(/'[^'\n]*'|"[^"\n]*"|`[^`\n]*`/g)) {
      for (const [id] of literal.matchAll(/RF-\d+/g)) {
        named.add(id);
      }
    }
  }
  return named;
}

describe('functional requirements', () => {
  const all = requirements();
  const named = requirementsNamedByTests();

  it('reads the requirements document', () => {
    expect(all.length).toBeGreaterThan(50);
  });

  it('checks every requirement with a test, or says why not yet', () => {
    const unaccounted = all.filter((id) => !named.has(id) && !(id in NOT_CHECKED_YET));

    expect(unaccounted).toEqual([]);
  });

  it('lists as "not checked yet" only requirements no test names', () => {
    const outdated = Object.keys(NOT_CHECKED_YET).filter((id) => named.has(id));

    expect(outdated).toEqual([]);
  });

  it('lists only requirements that exist', () => {
    const unknown = Object.keys(NOT_CHECKED_YET).filter((id) => !all.includes(id));

    expect(unknown).toEqual([]);
  });
});
