/**
 * Zod schemas for every content collection (see docs/02-technical-requirements.md §4).
 *
 * The schemas are framework-free: `src/content.config.ts` plugs them into Astro's content
 * collections, and the content integrity tests use them directly on the files.
 *
 * An entry's identity is its file name (without extension), so `id` is not a field here.
 * Relations always store the target entry's id, and each relation is stored on one side
 * only: media point to the texts they belong to (`recording.texts`, `artwork.texts`), a
 * panel points to its sheet. The other direction is derived by the catalog.
 */
import { z } from 'astro/zod';

/** Lowercase words separated by single hyphens: `sys-t-0012`, `sangre-y-sueno`. */
const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const entryIdSchema = z.string().regex(KEBAB_CASE, 'must be lowercase kebab-case');

/**
 * A date or an interval with year, month or day precision (W3C-DTF / ISO 8601 subset,
 * as recommended by Dublin Core): `1984`, `1993-05`, `1981-06-12`, `1993/1995`.
 */
const DATE_OR_INTERVAL = /^\d{4}(?:-\d{2}(?:-\d{2})?)?(?:\/\d{4}(?:-\d{2}(?:-\d{2})?)?)?$/;
export const archiveDateSchema = z
  .string()
  .regex(DATE_OR_INTERVAL, 'must look like 1984, 1993-05, 1981-06-12 or 1993/1995');

/** Path of a media file relative to PUBLIC_MEDIA_BASE_URL, e.g. `audio/sys-r-0001.mp3`. */
export const mediaPathSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9_.-]*(?:\/[a-z0-9][a-z0-9_.-]*)*$/, 'must be a normalized relative path');

export const rightsStatusSchema = z.enum(['cleared', 'pending', 'restricted']);
export type RightsStatus = z.infer<typeof rightsStatusSchema>;

const rightsFields = {
  rights: rightsStatusSchema,
  rightsHolder: z.string().min(1).optional(),
  license: z.string().min(1).default('all-rights-reserved'),
};

const altTitleSchema = z.object({
  title: z.string().min(1),
  source: z.string().min(1),
});

const creditSchema = z.object({
  person: entryIdSchema,
  role: z.string().min(1),
});

export const sectionSchema = z.object({
  id: entryIdSchema,
  title: z.string().min(1),
  slug: entryIdSchema,
  order: z.number().int(),
  description: z.string().optional(),
});
export type Section = z.infer<typeof sectionSchema>;

export const workStatusSchema = z.enum(['published', 'upcoming', 'draft']);
export type WorkStatus = z.infer<typeof workStatusSchema>;

export const workSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  /** Explicit, because a work URL is a permanent contract (the QR code points to it). */
  slug: entryIdSchema,
  status: workStatusSchema,
  year: archiveDateSchema.optional(),
  description: z.string().optional(),
  cover: entryIdSchema.optional(),
  sections: z.array(sectionSchema).default([]),
  order: z.number().int(),
});
export type Work = z.infer<typeof workSchema>;

export const textKindSchema = z.enum(['poem', 'song']);

export const textSchema = z.object({
  title: z.string().min(1),
  altTitles: z.array(altTitleSchema).default([]),
  work: entryIdSchema,
  section: entryIdSchema,
  order: z.number().int(),
  kind: textKindSchema,
  criticalNotes: z.string().optional(),
  facsimile: z.array(entryIdSchema).default([]),
  edition: z
    .object({
      name: z.string().min(1),
      year: archiveDateSchema.optional(),
      publisher: z.string().optional(),
      pages: z.string().optional(),
    })
    .optional(),
  provisional: z.boolean().default(false),
  /** Which of the recordings that point to this text is shown first. */
  primaryRecording: entryIdSchema.optional(),
  ...rightsFields,
});
export type Text = z.infer<typeof textSchema>;

export const recordingKindSchema = z.enum([
  'song',
  'recital',
  'reading',
  'interview',
  'lecture',
  'instrumental',
]);

export const recordingSchema = z.object({
  title: z.string().min(1),
  altTitles: z.array(altTitleSchema).default([]),
  texts: z.array(entryIdSchema).default([]),
  kind: recordingKindSchema,
  date: archiveDateSchema.optional(),
  collection: z.string().optional(),
  venue: z.string().optional(),
  performers: z.array(z.string().min(1)).default([]),
  credits: z.array(creditSchema).default([]),
  durationSeconds: z.number().positive(),
  audio: mediaPathSchema,
  originalUrl: z.url().optional(),
  trackNumber: z.number().int().positive().optional(),
  notes: z.string().optional(),
  ...rightsFields,
});
export type Recording = z.infer<typeof recordingSchema>;

export const artworkKindSchema = z.enum([
  'drawing',
  'watercolor',
  'painting',
  'photo',
  'document',
  'poster',
]);

export const artworkSchema = z.object({
  title: z.string().min(1),
  inventoryCode: z.string().min(1).optional(),
  inscription: z.string().optional(),
  kind: artworkKindSchema,
  technique: z.string().optional(),
  dimensions: z.string().optional(),
  date: archiveDateSchema.optional(),
  place: z.string().optional(),
  series: z.string().optional(),
  /** The multi-panel sheet this panel was cut from. A sheet's panels are derived from this. */
  sheet: entryIdSchema.optional(),
  texts: z.array(entryIdSchema).default([]),
  image: mediaPathSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  originalUrl: z.url().optional(),
  sourceFile: z.string().optional(),
  rating: z.number().int().min(1).max(3).optional(),
  animated: z.boolean().default(false),
  /** Alternative text is mandatory (WCAG 2.2 AA, RF-56). */
  alt: z.string().min(1),
  ...rightsFields,
});
export type Artwork = z.infer<typeof artworkSchema>;

export const videoSchema = z.object({
  title: z.string().min(1),
  series: z.string().optional(),
  episode: z.number().int().positive().optional(),
  date: archiveDateSchema.optional(),
  durationSeconds: z.number().positive().optional(),
  description: z.string().optional(),
  credits: z.array(creditSchema).default([]),
  youtubeId: z
    .string()
    .regex(/^[\w-]{11}$/, 'must be an 11-character YouTube id')
    .optional(),
  originalUrl: z.url().optional(),
  texts: z.array(entryIdSchema).default([]),
  ...rightsFields,
});
export type Video = z.infer<typeof videoSchema>;

export const personSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
export type Person = z.infer<typeof personSchema>;
