/**
 * Cross-entry rules that a single schema cannot check (docs/02-technical-requirements.md §4).
 *
 * Runs over **all** content, published or not, so that an editor's mistake is caught before
 * it is published (RF-71). Each rule reports problems instead of throwing, so one test run
 * lists every problem at once.
 */
import { undefinedCalls } from '../footnotes';
import { RESERVED_ROUTES, textSlug } from '../routes';
import type { CollectionName, Collections } from './collections';

export type { CollectionName } from './collections';

export interface IntegrityProblem {
  readonly collection: CollectionName;
  readonly id: string;
  readonly message: string;
}

/** Reports every value that appears more than once in `items`, keyed by `keyOf`. */
function duplicates<T>(items: readonly T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return new Map([...groups].filter(([, group]) => group.length > 1));
}

export function findIntegrityProblems(content: Collections): IntegrityProblem[] {
  const problems: IntegrityProblem[] = [];
  const report = (collection: CollectionName, id: string, message: string): void => {
    problems.push({ collection, id, message });
  };

  const ids = {
    works: new Set(content.works.map((entry) => entry.id)),
    texts: new Set(content.texts.map((entry) => entry.id)),
    recordings: new Set(content.recordings.map((entry) => entry.id)),
    artworks: new Set(content.artworks.map((entry) => entry.id)),
    videos: new Set(content.videos.map((entry) => entry.id)),
    people: new Set(content.people.map((entry) => entry.id)),
  };
  const expectExisting = (
    collection: CollectionName,
    id: string,
    field: string,
    target: CollectionName,
    targetId: string,
  ): void => {
    if (!ids[target].has(targetId)) {
      report(collection, id, `${field} points to missing ${target} entry "${targetId}"`);
    }
  };

  // Permanent links (/id/<id>/) need ids that are unique across collections.
  const pageBearing = [
    ...content.works.map((entry) => ({ collection: 'works' as const, id: entry.id })),
    ...content.texts.map((entry) => ({ collection: 'texts' as const, id: entry.id })),
    ...content.artworks.map((entry) => ({ collection: 'artworks' as const, id: entry.id })),
    ...content.videos.map((entry) => ({ collection: 'videos' as const, id: entry.id })),
  ];
  for (const [id, group] of duplicates(pageBearing, (entry) => entry.id)) {
    const owners = group.map((entry) => entry.collection).join(', ');
    for (const entry of group) {
      report(entry.collection, id, `id is used by several collections (${owners})`);
    }
  }

  for (const work of content.works) {
    if (RESERVED_ROUTES.includes(work.data.slug)) {
      report('works', work.id, `slug "${work.data.slug}" is a reserved route`);
    }
    if (work.data.cover !== undefined) {
      expectExisting('works', work.id, 'cover', 'artworks', work.data.cover);
    }
    for (const id of duplicates(work.data.sections, (section) => section.id).keys()) {
      report('works', work.id, `section id "${id}" is used more than once`);
    }
    for (const slug of duplicates(work.data.sections, (section) => section.slug).keys()) {
      report('works', work.id, `section slug "${slug}" is used more than once`);
    }
  }
  for (const [slug, group] of duplicates(content.works, (work) => work.data.slug)) {
    for (const work of group) {
      report('works', work.id, `slug "${slug}" is used by several works`);
    }
  }

  const worksById = new Map(content.works.map((work) => [work.id, work]));
  for (const text of content.texts) {
    const work = worksById.get(text.data.work);
    if (work === undefined) {
      report('texts', text.id, `work points to missing works entry "${text.data.work}"`);
    } else if (!work.data.sections.some((section) => section.id === text.data.section)) {
      report(
        'texts',
        text.id,
        `section "${text.data.section}" does not exist in work "${work.id}"`,
      );
    }
    if (textSlug(text) === '') {
      report('texts', text.id, 'title gives an empty URL slug');
    }
    for (const page of text.data.facsimile) {
      expectExisting('texts', text.id, 'facsimile', 'artworks', page);
    }
    for (const number of undefinedCalls(text.body, text.data.notes)) {
      report('texts', text.id, `calls note ${String(number)}, which its notes do not define`);
    }
    const primary = text.data.primaryRecording;
    if (primary !== undefined) {
      const recording = content.recordings.find((entry) => entry.id === primary);
      if (recording === undefined) {
        report(
          'texts',
          text.id,
          `primaryRecording points to missing recordings entry "${primary}"`,
        );
      } else if (!recording.data.texts.includes(text.id)) {
        report('texts', text.id, `primaryRecording "${primary}" does not list this text`);
      }
    }
  }
  const textsInSameWork = duplicates(
    content.texts,
    (text) => `${text.data.work}/${textSlug(text)}`,
  );
  for (const [key, group] of textsInSameWork) {
    for (const text of group) {
      report('texts', text.id, `URL "${key}" is shared with another text of the same work`);
    }
  }

  for (const recording of content.recordings) {
    for (const text of recording.data.texts) {
      expectExisting('recordings', recording.id, 'texts', 'texts', text);
    }
    for (const credit of recording.data.credits) {
      expectExisting('recordings', recording.id, 'credits', 'people', credit.person);
    }
  }

  for (const artwork of content.artworks) {
    for (const text of artwork.data.texts) {
      expectExisting('artworks', artwork.id, 'texts', 'texts', text);
    }
    if (artwork.data.sheet !== undefined) {
      expectExisting('artworks', artwork.id, 'sheet', 'artworks', artwork.data.sheet);
    }
  }

  for (const video of content.videos) {
    for (const text of video.data.texts) {
      expectExisting('videos', video.id, 'texts', 'texts', text);
    }
    for (const credit of video.data.credits) {
      expectExisting('videos', video.id, 'credits', 'people', credit.person);
    }
  }

  return problems;
}
