/**
 * Read model of the published archive: ordering, relations and permanent links.
 *
 * Pages ask the catalog what to show; they never sort or join collections themselves.
 * A catalog only holds published entries (see `publishedCollections`), so a relation whose
 * target is not published is simply not found and not shown.
 */
import type {
  ArtworkEntry,
  Collections,
  Entry,
  RecordingEntry,
  TextEntry,
  VideoEntry,
  WorkEntry,
} from './content/collections';
import { publishedCollections } from './content/publication';
import type { Section } from './content/schemas';
import { artworkPath, permalinkPath, textPath, videoPath, workPath } from './routes';

/** The recordings of a text: the primary one first (RF-17), or none at all (RF-18). */
export type RecordingVersions =
  | { readonly kind: 'unavailable' }
  | {
      readonly kind: 'available';
      readonly primary: RecordingEntry;
      readonly others: readonly RecordingEntry[];
    };

/** A permanent link: `/id/<id>/` leads to `target`, the entry's current URL. */
export interface Permalink {
  readonly id: string;
  readonly path: string;
  readonly target: string;
}

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

function byTitle(a: Entry<{ title: string }>, b: Entry<{ title: string }>): number {
  return collator.compare(a.data.title, b.data.title);
}

function byOrderThenTitle(
  a: Entry<{ order: number; title: string }>,
  b: Entry<{ order: number; title: string }>,
): number {
  return a.data.order - b.data.order || byTitle(a, b);
}

/** Dated entries first, oldest first; undated entries last, by title. */
function byDateThenTitle(
  a: Entry<{ date?: string | undefined; title: string }>,
  b: Entry<{ date?: string | undefined; title: string }>,
): number {
  const dateA = a.data.date ?? '￿';
  const dateB = b.data.date ?? '￿';
  return dateA.localeCompare(dateB) || byTitle(a, b);
}

function indexById<T extends { readonly id: string }>(entries: readonly T[]): Map<string, T> {
  return new Map(entries.map((entry) => [entry.id, entry]));
}

export class Catalog {
  private readonly content: Collections;
  private readonly worksById: Map<string, WorkEntry>;
  private readonly artworksById: Map<string, ArtworkEntry>;
  private readonly recordingsById: Map<string, RecordingEntry>;

  /** Builds a catalog from already-published content. Prefer `Catalog.published()`. */
  constructor(content: Collections) {
    this.content = content;
    this.worksById = indexById(content.works);
    this.artworksById = indexById(content.artworks);
    this.recordingsById = indexById(content.recordings);
  }

  /** The catalog of everything that may be published from `all`. */
  static published(all: Collections): Catalog {
    return new Catalog(publishedCollections(all));
  }

  /** Published and upcoming works, in their editorial order. */
  works(): WorkEntry[] {
    return [...this.content.works].sort(byOrderThenTitle);
  }

  /** Works with their own pages. */
  publishedWorks(): WorkEntry[] {
    return this.works().filter((work) => work.data.status === 'published');
  }

  /** Works announced as "próximamente". */
  upcomingWorks(): WorkEntry[] {
    return this.works().filter((work) => work.data.status === 'upcoming');
  }

  sectionsOf(work: WorkEntry): Section[] {
    return [...work.data.sections].sort(
      (a, b) => a.order - b.order || collator.compare(a.title, b.title),
    );
  }

  textsIn(work: WorkEntry, section: Section): TextEntry[] {
    return this.content.texts
      .filter((text) => text.data.work === work.id && text.data.section === section.id)
      .sort(byOrderThenTitle);
  }

  /** Every text of a work, section by section. */
  textsOf(work: WorkEntry): TextEntry[] {
    return this.sectionsOf(work).flatMap((section) => this.textsIn(work, section));
  }

  /** The work a published text belongs to; publishing guarantees it is published too. */
  workOf(text: TextEntry): WorkEntry {
    const work = this.worksById.get(text.data.work);
    if (work === undefined) {
      throw new Error(`Text "${text.id}" belongs to work "${text.data.work}", which is missing`);
    }
    return work;
  }

  recordingVersions(text: TextEntry): RecordingVersions {
    const linked = this.content.recordings
      .filter((recording) => recording.data.texts.includes(text.id))
      .sort(byDateThenTitle);
    const designated =
      text.data.primaryRecording === undefined
        ? undefined
        : this.recordingsById.get(text.data.primaryRecording);
    const primary =
      designated !== undefined && linked.includes(designated) ? designated : linked[0];
    if (primary === undefined) {
      return { kind: 'unavailable' };
    }
    return { kind: 'available', primary, others: linked.filter((each) => each !== primary) };
  }

  /** Artworks that illustrate a text (their `texts` field points to it). */
  illustrationsOf(text: TextEntry): ArtworkEntry[] {
    return this.content.artworks
      .filter((artwork) => artwork.data.texts.includes(text.id))
      .sort(byDateThenTitle);
  }

  /** The scanned pages of a text, in the order listed on the text. */
  facsimileOf(text: TextEntry): ArtworkEntry[] {
    return text.data.facsimile.flatMap((id) => {
      const page = this.artworksById.get(id);
      return page === undefined ? [] : [page];
    });
  }

  /** The panels cut from a multi-panel sheet. */
  panelsOf(sheet: ArtworkEntry): ArtworkEntry[] {
    return this.content.artworks.filter((artwork) => artwork.data.sheet === sheet.id).sort(byTitle);
  }

  artworks(): ArtworkEntry[] {
    return [...this.content.artworks].sort(byDateThenTitle);
  }

  videos(): VideoEntry[] {
    return [...this.content.videos].sort(byDateThenTitle);
  }

  recordings(): RecordingEntry[] {
    return [...this.content.recordings].sort(byDateThenTitle);
  }

  /** Permanent links of every entry that has a page (ADR 0037). */
  permalinks(): Permalink[] {
    const link = (id: string, target: string): Permalink => ({
      id,
      path: permalinkPath(id),
      target,
    });
    return [
      ...this.publishedWorks().flatMap((work) => [
        link(work.id, workPath(work)),
        ...this.textsOf(work).map((text) => link(text.id, textPath(work, text))),
      ]),
      ...this.artworks().map((artwork) => link(artwork.id, artworkPath(artwork))),
      ...this.videos().map((video) => link(video.id, videoPath(video))),
    ];
  }
}
