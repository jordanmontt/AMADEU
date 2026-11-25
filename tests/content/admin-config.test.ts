/**
 * The admin panel (public/admin/config.yml) mirrors the content schemas (RF-66 to RF-69,
 * RF-71, ADR 0055): the same fields, the same required ones, the same allowed values, the
 * same date and id formats, relations to collections that exist, and the folders the site
 * reads. If a schema changes and the admin does not, this test fails before an editor can
 * save something the site would reject.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import type { z } from 'astro/zod';
import {
  artworkSchema,
  pageSchema,
  personSchema,
  recordingSchema,
  textSchema,
  timelineEventSchema,
  videoSchema,
  workSchema,
} from '../../src/lib/content/schemas';
import { adminEditPath } from '../../src/lib/routes';

interface CmsField {
  name: string;
  widget?: string;
  required?: boolean;
  options?: (string | { value: string })[];
  pattern?: [string, string];
  collection?: string;
  multiple?: boolean;
  fields?: CmsField[];
  field?: CmsField;
  root?: boolean;
  media_folder?: string;
  public_folder?: string;
}

interface CmsCollection {
  name: string;
  folder?: string;
  extension?: string;
  fields?: CmsField[];
  files?: { name: string; file: string; fields: CmsField[] }[];
}

interface CmsConfig {
  media_folder: string;
  public_folder: string;
  collections: CmsCollection[];
}

const config = parse(readFileSync('public/admin/config.yml', 'utf8')) as CmsConfig;

type Schema = z.ZodType;
type ObjectSchema = z.ZodObject;

/** The schema inside optional and default wrappers. */
function inner(schema: Schema): Schema {
  let current = schema as Schema & { def: { type: string; innerType?: Schema } };
  while (current.def.type === 'optional' || current.def.type === 'default') {
    current = current.def.innerType as typeof current;
  }
  return current;
}

function typeOf(schema: Schema): string {
  return (inner(schema) as Schema & { def: { type: string } }).def.type;
}

/** Whether an entry may leave the field out: optional, or with a default value. */
function canBeLeftOut(schema: Schema): boolean {
  return schema.safeParse(undefined).success;
}

function collection(name: string): CmsCollection {
  const found = config.collections.find((each) => each.name === name);
  if (found === undefined) {
    throw new Error(`The admin has no collection "${name}"`);
  }
  return found;
}

function file(collectionName: string, fileName: string): { file: string; fields: CmsField[] } {
  const found = collection(collectionName).files?.find((each) => each.name === fileName);
  if (found === undefined) {
    throw new Error(`The admin has no file "${fileName}" in "${collectionName}"`);
  }
  return found;
}

/**
 * Every difference between a schema and the admin fields that edit it: missing or extra
 * fields, required ones that are optional (or the other way round), select values, list
 * and object contents. `extra` names fields the admin has that the schema handles elsewhere
 * (the body of a Markdown file, the image added by Astro).
 */
function differences(
  schema: ObjectSchema,
  fields: readonly CmsField[],
  path: string,
  extra: readonly string[] = [],
): string[] {
  const problems: string[] = [];
  const shape = schema.shape as Record<string, Schema>;
  const names = fields.map((field) => field.name);
  for (const key of Object.keys(shape)) {
    if (!names.includes(key)) {
      problems.push(`${path}: the admin has no field "${key}"`);
    }
  }
  for (const field of fields) {
    const where = `${path}.${field.name}`;
    const property = shape[field.name];
    if (property === undefined) {
      if (!extra.includes(field.name)) {
        problems.push(`${where}: the schema has no such field`);
      }
      continue;
    }
    const required = field.required ?? true;
    if (required === canBeLeftOut(property)) {
      problems.push(
        `${where}: required in the ${required ? 'admin' : 'schema'} but not in the ${required ? 'schema' : 'admin'}`,
      );
    }
    const type = typeOf(property);
    const innerSchema = inner(property);
    if (field.widget === 'select') {
      const values = (field.options ?? []).map((option) =>
        typeof option === 'string' ? option : option.value,
      );
      const allowed = (innerSchema as z.ZodEnum).options as readonly string[];
      if (type !== 'enum' || [...values].sort().join() !== [...allowed].sort().join()) {
        problems.push(
          `${where}: offers ${values.join(', ')}, the schema allows ${String(allowed)}`,
        );
      }
    }
    if (field.widget === 'list' && field.fields !== undefined) {
      const element = (innerSchema as z.ZodArray<Schema>).element;
      problems.push(...differences(inner(element) as ObjectSchema, field.fields, where));
    }
    if (field.widget === 'object' && field.fields !== undefined) {
      problems.push(...differences(innerSchema as ObjectSchema, field.fields, where));
    }
    if (field.widget === 'number' && type !== 'number') {
      problems.push(`${where}: a number in the admin, a ${type} in the schema`);
    }
    if (field.widget === 'boolean' && type !== 'boolean') {
      problems.push(`${where}: a checkbox in the admin, a ${type} in the schema`);
    }
    if (field.widget === 'relation') {
      const expected = field.multiple === true ? 'array' : 'string';
      if (type !== expected) {
        problems.push(
          `${where}: stores ${expected === 'array' ? 'a list' : 'one id'}, the schema a ${type}`,
        );
      }
    }
  }
  return problems;
}

/** Every field of the admin, at any depth. */
function allFields(fields: readonly CmsField[]): CmsField[] {
  return fields.flatMap((field) => [field, ...allFields(field.fields ?? [])]);
}

const everyField = config.collections.flatMap((each) =>
  allFields([...(each.fields ?? []), ...(each.files ?? []).flatMap((entry) => entry.fields)]),
);

describe('admin panel configuration (RF-66)', () => {
  it.each([
    ['works', workSchema, []],
    ['texts', textSchema, ['body']],
    ['recordings', recordingSchema, []],
    ['artworks', artworkSchema, ['image']],
    ['videos', videoSchema, []],
    ['people', personSchema, []],
  ] as const)('edits %s with exactly the fields of its schema', (name, schema, extra) => {
    expect(differences(schema, collection(name).fields ?? [], name, extra)).toEqual([]);
  });

  it('edits the biography and the timeline with the fields of their schemas (RF-66)', () => {
    const biography = file('pages', 'marcelo');
    const [events] = file('pages', 'timeline').fields;

    expect(differences(pageSchema, biography.fields, 'biography', ['body'])).toEqual([]);
    expect(events?.root).toBe(true);
    expect(differences(timelineEventSchema, events?.fields ?? [], 'timeline', ['id'])).toEqual([]);
  });

  it('saves every collection in the folder the site reads, as the site names it', () => {
    const folders = Object.fromEntries(
      config.collections.flatMap((each) =>
        each.folder === undefined ? [] : [[each.name, `${each.folder}.${each.extension ?? ''}`]],
      ),
    );

    expect(folders).toEqual({
      works: 'src/content/works.yml',
      texts: 'src/content/texts.md',
      recordings: 'src/content/recordings.yml',
      artworks: 'src/content/artworks.yml',
      videos: 'src/content/videos.yml',
      people: 'src/content/people.yml',
    });
    expect(file('pages', 'marcelo').file).toBe('src/content/pages/marcelo.md');
    expect(file('pages', 'timeline').file).toBe('src/content/timeline.yml');
  });

  it('opens every entry the pending tasks link to (RF-72)', () => {
    for (const name of ['works', 'texts', 'recordings', 'artworks', 'videos', 'people'] as const) {
      expect(adminEditPath(name, 'x')).toBe(
        `/admin/#/collections/${collection(name).name}/entries/x`,
      );
    }
  });

  it('lets editors set the order of works, sections and texts (RF-69)', () => {
    const works = collection('works').fields ?? [];
    const sections = works.find((field) => field.name === 'sections')?.fields ?? [];
    const texts = collection('texts').fields ?? [];

    for (const fields of [works, sections, texts]) {
      expect(fields.find((field) => field.name === 'order')?.widget).toBe('number');
    }
  });

  it('relates entries only to collections that exist (RF-68)', () => {
    const names = config.collections.map((each) => each.name);
    const targets = everyField.flatMap((field) =>
      field.widget === 'relation' ? [field.collection ?? ''] : [],
    );

    expect(targets.length).toBeGreaterThan(5);
    expect(targets.filter((target) => !names.includes(target))).toEqual([]);
  });

  it('accepts the same dates and ids as the site, and refuses the same ones (RF-71)', () => {
    const patterns = new Set(
      everyField.flatMap((field) => (field.pattern === undefined ? [] : [field.pattern[0]])),
    );
    const date = [...patterns].find((pattern) => pattern.includes('\\d{4}'));
    const kebab = [...patterns].find((pattern) => pattern.includes('[a-z0-9]+(?:-'));
    const dates = ['1984', '1993-05', '1981-06-12', '1993/1995', '84', '1993-5', 'mayo 1993'];
    const ids = ['sangre-y-sueno', 'cancionero', 'tomo-1', 'Sangre', 'sangre_y', '-sangre', 'año'];

    expect(date).toBeDefined();
    expect(kebab).toBeDefined();
    const dateField = workSchema.shape.year as Schema;
    const idField = workSchema.shape.slug as Schema;
    for (const value of dates) {
      expect(new RegExp(date ?? '').test(value), value).toBe(dateField.safeParse(value).success);
    }
    for (const value of ids) {
      expect(new RegExp(kebab ?? '').test(value), value).toBe(idField.safeParse(value).success);
    }
  });

  it('stores images and audio where the site reads them (RF-67)', () => {
    const artworks = collection('artworks').fields ?? [];
    const image = artworks.find((field) => field.name === 'image');
    const audio = (collection('recordings').fields ?? []).find((field) => field.name === 'audio');

    expect(config.media_folder).toBe('src/content/media/images');
    // Relative to each collection's folder, src/content/<collection>/.
    expect(image?.media_folder).toBe('../media/images');
    expect(image?.public_folder).toBe('../media/images');
    expect(audio?.media_folder).toBe('../media/audio');
  });
});
