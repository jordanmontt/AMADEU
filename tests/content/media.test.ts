/**
 * Media files in the content folder (ADR 0044): every referenced file exists, and no file
 * sits in the repository without an entry using it (it would only add weight).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { loadContent } from '../support/load-content';

function filesIn(folder: string): string[] {
  return existsSync(folder) ? readdirSync(folder).filter((name) => !name.startsWith('.')) : [];
}

/** The `image` field is added by Astro's `image()` helper, so read it from the raw files. */
function artworkImagePaths(contentDir: string): string[] {
  const folder = join(contentDir, 'artworks');
  return filesIn(folder).map((file) => {
    const data = parse(readFileSync(join(folder, file), 'utf8')) as { image: string };
    return resolve(folder, data.image);
  });
}

describe.each([
  ['real content', 'src/content'],
  ['E2E fixture content', 'tests/fixtures/content'],
])('%s', (_name, contentDir) => {
  const content = loadContent(contentDir);
  const audioDir = join(contentDir, 'media', 'audio');
  const imageDir = resolve(contentDir, 'media', 'images');

  it('has an audio file for every recording', () => {
    const missing = content.recordings
      .map((recording) => recording.data.audio)
      .filter((file) => !existsSync(join(audioDir, file)));

    expect(missing).toEqual([]);
  });

  it('has an image file for every artwork, inside the media folder', () => {
    const paths = artworkImagePaths(contentDir);

    expect(paths.filter((path) => !existsSync(path))).toEqual([]);
    expect(paths.filter((path) => !path.startsWith(`${imageDir}/`))).toEqual([]);
  });

  it('has no media file that no entry uses', () => {
    const usedAudio = new Set(content.recordings.map((recording) => recording.data.audio));
    const usedImages = new Set(artworkImagePaths(contentDir));

    expect(filesIn(audioDir).filter((file) => !usedAudio.has(file))).toEqual([]);
    expect(filesIn(imageDir).filter((file) => !usedImages.has(join(imageDir, file)))).toEqual([]);
  });
});
