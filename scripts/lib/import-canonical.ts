/**
 * Applies the canonical edition to the texts of a work (ADR 0057): the manifest
 * (`scripts/import/data/canonical.yml`) says which printed text is which archive entry, and
 * the PDF gives the verses and notes. Pure: the caller reads and writes the files.
 */
import { type CanonicalText, bodyAndNotes, isInVerses } from './canonical';

export interface AltTitle {
  readonly title: string;
  readonly source: string;
}

export interface ManifestText {
  readonly printed: string;
  readonly id?: string;
  readonly title?: string;
  readonly altTitles?: readonly AltTitle[];
  readonly review?: string;
  readonly skip?: string;
}

export interface ManifestSection {
  readonly id: string;
  readonly firstPage: number;
  readonly lastPage: number;
  readonly texts: readonly ManifestText[];
}

export interface Manifest {
  readonly work: string;
  readonly edition: { readonly name: string; readonly year: string };
  /** Sections the canonical ones replace: each of their texts must be placed. */
  readonly replaces: readonly string[];
  readonly sections: readonly ManifestSection[];
}

export interface ExistingText {
  readonly data: Record<string, unknown>;
  readonly body: string;
}

export interface PlannedText {
  readonly id: string;
  readonly data: Record<string, unknown>;
  readonly body: string;
  /** What happened to the text: its verses replaced, or kept from the earlier edition. */
  readonly change: 'created' | 'replaced' | 'reordered';
}

export interface Plan {
  readonly texts: readonly PlannedText[];
  readonly skipped: readonly { readonly printed: string; readonly reason: string }[];
}

/** Gap between consecutive texts' `order`, so editors can insert one in between (RF-05). */
const ORDER_STEP = 10;

/** The order of keys in a text file, so every file reads the same way. */
const KEY_ORDER = [
  'title',
  'altTitles',
  'work',
  'section',
  'order',
  'kind',
  'dedication',
  'notes',
  'criticalNotes',
  'facsimile',
  'edition',
  'provisional',
  'primaryRecording',
  'review',
  'rights',
  'rightsHolder',
  'license',
];

function ordered(data: Record<string, unknown>): Record<string, unknown> {
  const keys = [
    ...KEY_ORDER.filter((key) => key in data),
    ...Object.keys(data).filter((key) => !KEY_ORDER.includes(key)),
  ];
  const empty = (value: unknown): boolean =>
    value === undefined || (Array.isArray(value) && value.length === 0);
  return Object.fromEntries(keys.flatMap((key) => (empty(data[key]) ? [] : [[key, data[key]]])));
}

/** Titles compared without case, accents or punctuation. */
function sameTitle(a: string, b: string): boolean {
  const plain = (title: string): string =>
    title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/gi, ' ')
      .trim()
      .toLowerCase();
  return plain(a) === plain(b);
}

/**
 * The alternative titles of a text: the ones it had, the ones the manifest adds, and its
 * previous title when the canonical one differs, all but the current title, without repeats.
 */
function altTitles(
  title: string,
  existing: ExistingText | undefined,
  added: readonly AltTitle[],
): AltTitle[] {
  const previous = existing?.data.title;
  const edition = (existing?.data.edition as { name?: string; year?: string } | undefined) ?? {};
  const previousSource = [edition.name, edition.year].filter(Boolean).join(', ');
  const candidates = [
    ...((existing?.data.altTitles as AltTitle[] | undefined) ?? []),
    ...added,
    ...(typeof previous === 'string' && previousSource !== ''
      ? [{ title: previous, source: previousSource }]
      : []),
  ];
  const kept: AltTitle[] = [];
  for (const candidate of candidates) {
    if (
      !sameTitle(candidate.title, title) &&
      !kept.some((each) => sameTitle(each.title, candidate.title))
    ) {
      kept.push(candidate);
    }
  }
  return kept;
}

function withReview(current: unknown, added: string | undefined): string | undefined {
  const reviews = [typeof current === 'string' ? current : undefined, added].filter(
    (review): review is string => review !== undefined && review !== '',
  );
  return reviews.length === 0 ? undefined : [...new Set(reviews)].join(' ');
}

/**
 * Plans every change: one entry per text of the manifest, with its new data and body.
 * Throws when the PDF and the manifest disagree, or when a text of a replaced section is
 * left out, so a wrong mapping can never be written.
 */
export function planCanonical(
  manifest: Manifest,
  printedBySection: ReadonlyMap<string, readonly CanonicalText[]>,
  existing: ReadonlyMap<string, ExistingText>,
): Plan {
  const texts: PlannedText[] = [];
  const skipped: { printed: string; reason: string }[] = [];
  for (const section of manifest.sections) {
    const printed = printedBySection.get(section.id) ?? [];
    if (printed.length !== section.texts.length) {
      throw new Error(
        `${section.id}: the PDF has ${String(printed.length)} texts, the manifest ${String(section.texts.length)}`,
      );
    }
    section.texts.forEach((entry, index) => {
      const text = printed[index];
      if (text?.title !== entry.printed) {
        throw new Error(
          `${section.id} #${String(index + 1)}: the PDF prints «${text?.title ?? ''}», the manifest expects «${entry.printed}»`,
        );
      }
      if (entry.id === undefined) {
        skipped.push({ printed: entry.printed, reason: entry.skip ?? 'no id' });
        return;
      }
      const current = existing.get(entry.id);
      const title = entry.title ?? entry.printed;
      const common = {
        title,
        altTitles: altTitles(title, current, entry.altTitles ?? []),
        work: manifest.work,
        section: section.id,
        order: (index + 1) * ORDER_STEP,
      };
      const verses = isInVerses(text);
      if (!verses && current === undefined) {
        throw new Error(`${entry.id}: «${entry.printed}» is prose and has no earlier verses`);
      }
      if (!verses && current !== undefined) {
        texts.push({
          id: entry.id,
          data: ordered({
            ...current.data,
            ...common,
            review: withReview(current.data.review, entry.review),
          }),
          body: current.body,
          change: 'reordered',
        });
        return;
      }
      const { body, notes } = bodyAndNotes(text);
      texts.push({
        id: entry.id,
        data: ordered({
          kind: 'song',
          rights: 'cleared',
          ...current?.data,
          ...common,
          dedication: text.dedication ?? undefined,
          notes,
          edition: { ...manifest.edition, pages: String(text.page) },
          provisional: false,
          review: withReview(current?.data.review, entry.review),
        }),
        body,
        change: current === undefined ? 'created' : 'replaced',
      });
    });
  }
  const placed = new Set(texts.map((text) => text.id));
  const left = [...existing]
    .filter(
      ([id, text]) =>
        text.data.work === manifest.work &&
        manifest.replaces.includes(String(text.data.section)) &&
        !placed.has(id),
    )
    .map(([id]) => id);
  if (left.length > 0) {
    throw new Error(
      `Texts of a replaced section that the manifest does not place: ${left.join(', ')}`,
    );
  }
  return { texts, skipped };
}
