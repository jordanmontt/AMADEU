import { describe, expect, it } from 'vitest';
import {
  AudioTooLongError,
  PUBLISHED_FILE_LIMIT_BYTES,
  audioPublishing,
  reducedSizeBytes,
} from './audio';

const MINUTE = 60;

describe('audioPublishing', () => {
  it('publishes files within the 25 MiB limit as they are', () => {
    expect(audioPublishing('song.mp3', 3_000_000, 3 * MINUTE)).toEqual({ kind: 'as-is' });
    expect(audioPublishing('edge.mp3', PUBLISHED_FILE_LIMIT_BYTES, 26 * MINUTE)).toEqual({
      kind: 'as-is',
    });
  });

  it('reduces larger files to mono 64 kbps (a 46-minute recital fits) (RF-25)', () => {
    expect(audioPublishing('goethe-1981.mp3', 44_600_000, 46 * MINUTE + 25)).toEqual({
      kind: 'reduced',
      bitrateKbps: 64,
      channels: 1,
    });
  });

  it('refuses recordings too long to fit even when reduced, naming the file', () => {
    expect(() => audioPublishing('long.mp3', 60_000_000, 60 * MINUTE)).toThrow(AudioTooLongError);
    expect(() => audioPublishing('long.mp3', 60_000_000, 60 * MINUTE)).toThrow(
      /long\.mp3 \(60 min\).*split/,
    );
  });

  it('estimates the reduced size from the duration', () => {
    expect(reducedSizeBytes(MINUTE)).toBeCloseTo(489_600);
  });
});
