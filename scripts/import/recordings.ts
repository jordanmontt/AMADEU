/**
 * Imports recordings listed in scripts/import/data/recordings.yml (RT §10, step 2):
 * copies (or converts) the audio into src/content/media/audio/ and writes one entry each.
 * Marks primary versions on their texts. Usage: npx tsx scripts/import/recordings.ts [--force]
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { archivePath, contentRoot, overwrite, writeContentFile } from '../lib/archive';
import { withPrimaryRecording, yamlEntry } from '../lib/content-files';
import {
  type RecordingManifestItem,
  audioFileName,
  needsConversion,
  recordingData,
} from '../lib/import-recordings';

const items = parse(
  readFileSync('scripts/import/data/recordings.yml', 'utf8'),
) as RecordingManifestItem[];
const audioDir = join(contentRoot, 'media', 'audio');
mkdirSync(audioDir, { recursive: true });

function durationSeconds(path: string): number {
  const output = execFileSync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'csv=p=0',
    path,
  ]).toString();
  return Number(output.trim());
}

let written = 0;
for (const item of items) {
  const source = archivePath(item.source);
  const target = join(audioDir, audioFileName(item));
  if (!existsSync(target) || overwrite) {
    if (needsConversion(item)) {
      execFileSync('ffmpeg', [
        '-v',
        'error',
        '-y',
        '-i',
        source,
        '-vn',
        '-c:a',
        'libmp3lame',
        '-b:a',
        '128k',
        target,
      ]);
    } else {
      copyFileSync(source, target);
    }
  }
  const entry = join(contentRoot, 'recordings', `${item.id}.yml`);
  if (
    writeContentFile(entry, yamlEntry(recordingData(item, durationSeconds(target)))) === 'written'
  ) {
    written += 1;
  }
  const [firstText] = item.texts;
  if (item.primary === true && firstText !== undefined) {
    const textFile = join(contentRoot, 'texts', `${firstText}.md`);
    writeFileSync(textFile, withPrimaryRecording(readFileSync(textFile, 'utf8'), item.id));
  }
}
console.log(`recordings: ${items.length} items (${written} entries written)`);
