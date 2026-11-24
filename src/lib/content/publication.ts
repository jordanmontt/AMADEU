/**
 * Decides which entries are published (RF-57, RT-51).
 *
 * - Works in `draft` are hidden; `upcoming` works are kept so the home page can show them
 *   as "próximamente", but their texts are not published.
 * - Texts, recordings, artworks and videos are published only when their rights are
 *   `cleared`. A text also needs its work to be `published`.
 * - People have no rights status: they only appear as credits of published entries.
 *
 * Relations that point to an unpublished entry stay in the data; the catalog simply does
 * not find the target, so it is not shown.
 */
import type { Collections, WorkEntry } from './collections';
import type { RightsStatus } from './schemas';

function isCleared(entry: { readonly data: { readonly rights: RightsStatus } }): boolean {
  return entry.data.rights === 'cleared';
}

export function publishedCollections(all: Collections): Collections {
  const works = all.works.filter((work) => work.data.status !== 'draft');
  const publishedWorkIds = new Set(
    works.filter((work: WorkEntry) => work.data.status === 'published').map((work) => work.id),
  );
  return {
    works,
    texts: all.texts.filter((text) => isCleared(text) && publishedWorkIds.has(text.data.work)),
    recordings: all.recordings.filter(isCleared),
    artworks: all.artworks.filter(isCleared),
    videos: all.videos.filter(isCleared),
    people: all.people,
  };
}
