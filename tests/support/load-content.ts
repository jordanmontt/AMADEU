/**
 * Reads a content folder from disk the way `src/content.config.ts` declares it (one folder
 * per collection, id = file name), and validates every file with the real schemas.
 * Used by the content integrity tests, which must not depend on an Astro build.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { parse } from 'yaml';
import type { Collections, Entry, TextEntry } from '../../src/lib/content/collections';
import {
  artworkSchema,
  personSchema,
  recordingSchema,
  textSchema,
  videoSchema,
  workSchema,
} from '../../src/lib/content/schemas';

interface Schema<T> {
  parse(input: unknown): T;
}

function filesOf(folder: string, extensions: readonly string[]): string[] {
  return readdirSync(folder)
    .filter((name) => extensions.includes(extname(name)))
    .sort()
    .map((name) => join(folder, name));
}

function idOf(file: string): string {
  return basename(file, extname(file));
}

/** Parses a file with the schema, naming the file in the error so editors can find it. */
function parseFile<T>(file: string, schema: Schema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    throw new Error(`${file} is invalid: ${String(error)}`, { cause: error });
  }
}

function yamlEntries<T>(folder: string, schema: Schema<T>): Entry<T>[] {
  return filesOf(folder, ['.yml', '.yaml']).map((file) => ({
    id: idOf(file),
    data: parseFile(file, schema, parse(readFileSync(file, 'utf8'))),
  }));
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function markdownEntries(folder: string): TextEntry[] {
  return filesOf(folder, ['.md']).map((file) => {
    const match = FRONTMATTER.exec(readFileSync(file, 'utf8'));
    if (match === null) {
      throw new Error(`${file} has no YAML frontmatter`);
    }
    const [, frontmatter = '', body = ''] = match;
    return { id: idOf(file), body, data: parseFile(file, textSchema, parse(frontmatter)) };
  });
}

export function loadContent(contentDir: string): Collections {
  return {
    works: yamlEntries(join(contentDir, 'works'), workSchema),
    texts: markdownEntries(join(contentDir, 'texts')),
    recordings: yamlEntries(join(contentDir, 'recordings'), recordingSchema),
    artworks: yamlEntries(join(contentDir, 'artworks'), artworkSchema),
    videos: yamlEntries(join(contentDir, 'videos'), videoSchema),
    people: yamlEntries(join(contentDir, 'people'), personSchema),
  };
}
