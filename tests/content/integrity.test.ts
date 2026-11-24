/**
 * Content integrity over the real content (and the E2E fixture content). This is what stops
 * an editor's mistake from being published (RF-71): CI runs it before every deploy.
 */
import { describe, expect, it } from 'vitest';
import { entryIdSchema } from '../../src/lib/content/schemas';
import { findIntegrityProblems } from '../../src/lib/content/integrity';
import { loadContent } from '../support/load-content';

describe.each([
  ['real content', 'src/content'],
  ['E2E fixture content', 'tests/fixtures/content'],
])('%s', (_name, contentDir) => {
  const content = loadContent(contentDir);

  it('names every file with a valid id (lowercase kebab-case)', () => {
    const invalid = Object.values(content)
      .flat()
      .map((entry: { id: string }) => entry.id)
      .filter((id) => !entryIdSchema.safeParse(id).success);

    expect(invalid).toEqual([]);
  });

  it('has no integrity problems', () => {
    expect(findIntegrityProblems(content)).toEqual([]);
  });
});
