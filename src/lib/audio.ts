/**
 * How an audio file is published (ADR 0045).
 *
 * Cloudflare Pages rejects files over 25 MiB. Files within the limit are published as
 * they are; larger ones are re-encoded to mono MP3 at 64 kbps (a known limitation). A
 * recording too long to fit even then cannot be published and must be split.
 */
export const PUBLISHED_FILE_LIMIT_BYTES = 25 * 1024 * 1024;
export const REDUCED_BITRATE_KBPS = 64;

/** MP3 frame headers and tags add a little to the raw bitrate. */
const MP3_OVERHEAD = 1.02;

export type AudioPublishing =
  | { readonly kind: 'as-is' }
  | { readonly kind: 'reduced'; readonly bitrateKbps: number; readonly channels: 1 };

export class AudioTooLongError extends Error {
  constructor(fileName: string, durationSeconds: number) {
    const minutes = Math.round(durationSeconds / 60);
    super(
      `${fileName} (${minutes} min) is too long to publish under 25 MiB even at ` +
        `${REDUCED_BITRATE_KBPS} kbps mono; split it into shorter recordings`,
    );
    this.name = 'AudioTooLongError';
  }
}

/** Estimated size of the reduced version, in bytes. */
export function reducedSizeBytes(durationSeconds: number): number {
  return ((durationSeconds * REDUCED_BITRATE_KBPS * 1000) / 8) * MP3_OVERHEAD;
}

export function audioPublishing(
  fileName: string,
  sizeBytes: number,
  durationSeconds: number,
): AudioPublishing {
  if (sizeBytes <= PUBLISHED_FILE_LIMIT_BYTES) {
    return { kind: 'as-is' };
  }
  if (reducedSizeBytes(durationSeconds) > PUBLISHED_FILE_LIMIT_BYTES) {
    throw new AudioTooLongError(fileName, durationSeconds);
  }
  return { kind: 'reduced', bitrateKbps: REDUCED_BITRATE_KBPS, channels: 1 };
}
