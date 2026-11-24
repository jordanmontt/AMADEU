/**
 * Turns the texts split from Tomo I into content entries for one work (RF-59).
 */
import { slugify } from '../../src/lib/slug';
import type { BookText } from './tomo';
import { verseBody } from './tomo';

export interface SectionImport {
  readonly section: string;
  readonly kind: 'poem' | 'song';
}

export interface EditionInfo {
  readonly name: string;
  readonly year: string;
  readonly publisher: string;
}

export interface TextImportSettings {
  readonly work: string;
  /** Ids already used by page-bearing entries (e.g. works); a text never reuses one. */
  readonly takenIds: ReadonlySet<string>;
  readonly edition: EditionInfo;
  readonly titleCorrections: Readonly<Record<string, string>>;
}

export interface ImportedText {
  readonly id: string;
  readonly data: Record<string, unknown>;
  readonly body: string;
}

/** Order values leave room to insert texts between existing ones from the admin. */
const ORDER_STEP = 10;

const KIND_SUFFIX = { song: 'cancion', poem: 'poema' } as const;

/**
 * A text's id is its title's slug, unless another entry already uses it (the title poem
 * "Sangre y sueño" vs. the work "Sangre y Sueño"): then the kind is appended, because ids
 * must be unique across page-bearing collections for `/id/<id>/`.
 */
export function textId(
  title: string,
  kind: SectionImport['kind'],
  takenIds: ReadonlySet<string>,
): string {
  const slug = slugify(title);
  return takenIds.has(slug) ? `${slug}-${KIND_SUFFIX[kind]}` : slug;
}

export function importedTexts(
  texts: readonly BookText[],
  section: SectionImport,
  settings: TextImportSettings,
): ImportedText[] {
  return texts.map((text, index) => {
    const corrected = settings.titleCorrections[text.title];
    const title = corrected ?? text.title;
    const data: Record<string, unknown> = {
      title,
      ...(corrected === undefined
        ? {}
        : { altTitles: [{ title: text.title, source: `${settings.edition.name} (errata)` }] }),
      work: settings.work,
      section: section.section,
      order: (index + 1) * ORDER_STEP,
      kind: section.kind,
      ...(text.dedication === null ? {} : { dedication: text.dedication }),
      ...(text.notes.length === 0 ? {} : { notes: text.notes.join('\n') }),
      edition: { ...settings.edition, pages: String(text.page) },
      provisional: true,
      rights: 'cleared',
    };
    return { id: textId(title, section.kind, settings.takenIds), data, body: verseBody(text) };
  });
}
