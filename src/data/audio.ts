/**
 * Reads an audio file from the content folder and prepares the bytes to publish
 * (ADR 0045): unchanged when it fits Cloudflare Pages' limit, re-encoded with ffmpeg
 * otherwise. The decision itself lives in `src/lib/audio.ts`.
 */
import { execFile } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { contentDir } from '../content-dir';
import { PUBLISHED_FILE_LIMIT_BYTES, audioPublishing } from '../lib/audio';
import type { RecordingEntry } from '../lib/content/collections';

const run = promisify(execFile);

export function audioSourcePath(fileName: string): string {
  return join(contentDir, 'media', 'audio', fileName);
}

async function reencode(path: string, bitrateKbps: number, channels: number): Promise<Buffer> {
  const { stdout } = await run(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      path,
      '-ac',
      String(channels),
      '-b:a',
      `${bitrateKbps}k`,
      '-f',
      'mp3',
      'pipe:1',
    ],
    { encoding: 'buffer', maxBuffer: PUBLISHED_FILE_LIMIT_BYTES * 2 },
  );
  if (stdout.byteLength > PUBLISHED_FILE_LIMIT_BYTES) {
    throw new Error(`${path} is still over 25 MiB after re-encoding (${stdout.byteLength} bytes)`);
  }
  return stdout;
}

export async function publishedAudio(recording: RecordingEntry): Promise<Buffer> {
  const path = audioSourcePath(recording.data.audio);
  const { size } = await stat(path);
  const plan = audioPublishing(recording.data.audio, size, recording.data.durationSeconds);
  return plan.kind === 'as-is' ? readFile(path) : reencode(path, plan.bitrateKbps, plan.channels);
}
