/**
 * Test data builders. Each builder parses its input with the real schema, so fixtures get
 * the same defaults and validation as real content, and a test only spells out the fields
 * it cares about.
 */
import type {
  ArtworkEntry,
  Collections,
  PersonEntry,
  RecordingEntry,
  TextEntry,
  VideoEntry,
  WorkEntry,
} from '../../src/lib/content/collections';
import {
  artworkSchema,
  personSchema,
  recordingSchema,
  textSchema,
  videoSchema,
  workSchema,
} from '../../src/lib/content/schemas';

type Input = Record<string, unknown>;

export function aWork(id: string, fields: Input = {}): WorkEntry {
  return {
    id,
    data: workSchema.parse({
      title: `Work ${id}`,
      slug: id,
      status: 'published',
      order: 1,
      sections: [{ id: 'main', title: 'Main', slug: 'main', order: 1 }],
      ...fields,
    }),
  };
}

export function aText(id: string, fields: Input = {}, body = 'Verso uno\nVerso dos'): TextEntry {
  return {
    id,
    body,
    data: textSchema.parse({
      title: `Text ${id}`,
      work: 'work',
      section: 'main',
      order: 1,
      kind: 'song',
      rights: 'cleared',
      ...fields,
    }),
  };
}

export function aRecording(id: string, fields: Input = {}): RecordingEntry {
  return {
    id,
    data: recordingSchema.parse({
      title: `Recording ${id}`,
      kind: 'song',
      durationSeconds: 120,
      audio: `${id}.mp3`,
      rights: 'cleared',
      ...fields,
    }),
  };
}

export function anArtwork(id: string, fields: Input = {}): ArtworkEntry {
  return {
    id,
    data: artworkSchema.parse({
      title: `Artwork ${id}`,
      kind: 'drawing',
      alt: `Description of ${id}`,
      rights: 'cleared',
      ...fields,
    }),
  };
}

export function aVideo(id: string, fields: Input = {}): VideoEntry {
  return {
    id,
    data: videoSchema.parse({ title: `Video ${id}`, rights: 'cleared', ...fields }),
  };
}

export function aPerson(id: string, fields: Input = {}): PersonEntry {
  return { id, data: personSchema.parse({ name: `Person ${id}`, ...fields }) };
}

export function collections(parts: Partial<Collections> = {}): Collections {
  return {
    works: [],
    texts: [],
    recordings: [],
    artworks: [],
    videos: [],
    people: [],
    ...parts,
  };
}
