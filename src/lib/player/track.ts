/**
 * A track: what the audio player needs to know about a recording (RF-47, RF-48).
 *
 * Pages build tracks at build time and hand them to the player as JSON in a button's data
 * attribute; the player reads them back with `parseTracks`, which rejects anything that is
 * not a list of tracks.
 */
import type { RecordingEntry } from '../content/collections';
import { audioPath } from '../routes';

export interface Track {
  /** The recording's permanent id. */
  readonly id: string;
  readonly title: string;
  /** Where the recording came from, for example "LP Discolandia 1984". */
  readonly collection?: string;
  /** URL of the audio file. */
  readonly src: string;
  readonly durationSeconds: number;
  /** The page of the text the recording is a version of, where its lyrics are. */
  readonly href?: string;
}

/** The track of a recording; `href` is the page of its text, if it has one. */
export function recordingTrack(recording: RecordingEntry, href?: string): Track {
  const { title, collection, durationSeconds } = recording.data;
  return {
    id: recording.id,
    title,
    src: audioPath(recording),
    durationSeconds,
    ...(collection === undefined ? {} : { collection }),
    ...(href === undefined ? {} : { href }),
  };
}

export class InvalidTracksError extends Error {
  constructor(reason: string) {
    super(`Invalid player tracks: ${reason}`);
    this.name = 'InvalidTracksError';
  }
}

/** Reads the tracks a page wrote with `JSON.stringify`; throws `InvalidTracksError` otherwise. */
export function parseTracks(json: string): Track[] {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new InvalidTracksError('not JSON');
  }
  if (!Array.isArray(value)) {
    throw new InvalidTracksError('not a list');
  }
  return value.map((item, index) => asTrack(item, index));
}

function asTrack(item: unknown, index: number): Track {
  if (typeof item !== 'object' || item === null) {
    throw new InvalidTracksError(`item ${String(index)} is not an object`);
  }
  const fields = item as Record<string, unknown>;
  const text = (name: string): string => {
    const field = fields[name];
    if (typeof field !== 'string' || field === '') {
      throw new InvalidTracksError(`item ${String(index)} has no "${name}"`);
    }
    return field;
  };
  const optionalText = (name: string): Record<string, string> =>
    fields[name] === undefined ? {} : { [name]: text(name) };
  const durationSeconds = fields.durationSeconds;
  if (typeof durationSeconds !== 'number' || !(durationSeconds > 0)) {
    throw new InvalidTracksError(`item ${String(index)} has no positive "durationSeconds"`);
  }
  return {
    id: text('id'),
    title: text('title'),
    src: text('src'),
    durationSeconds,
    ...optionalText('collection'),
    ...optionalText('href'),
  };
}
