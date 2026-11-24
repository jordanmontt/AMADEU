/**
 * What the Foundation still has to do, derived from the content itself (RF-72, ADR 0046).
 *
 * There is no separate task list to keep in sync: a task disappears as soon as the content
 * no longer needs it (rights confirmed, recording linked, `review` cleared…). Runs over all
 * content, published or not.
 */
import type { CollectionName, Collections } from './collections';

/** Task kinds, in the order they are shown (most blocking first). */
export const PENDING_TASK_KINDS = [
  'rights-pending',
  'review',
  'song-without-recording',
  'recording-without-text',
  'video-without-youtube',
  'provisional-text',
  'artwork-without-inventory-code',
] as const;
export type PendingTaskKind = (typeof PENDING_TASK_KINDS)[number];

export interface PendingTask {
  readonly kind: PendingTaskKind;
  readonly collection: CollectionName;
  readonly id: string;
  readonly title: string;
  /** What exactly to check, when the content says it (the `review` field). */
  readonly detail?: string;
}

export interface PendingTaskGroup {
  readonly kind: PendingTaskKind;
  readonly tasks: readonly PendingTask[];
}

interface Reviewable {
  readonly id: string;
  readonly data: {
    readonly title: string;
    readonly rights: string;
    readonly review?: string | undefined;
  };
}

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

export function pendingTasks(content: Collections): PendingTask[] {
  const tasks: PendingTask[] = [];
  const add = (
    kind: PendingTaskKind,
    collection: CollectionName,
    entry: Reviewable,
    detail?: string,
  ) => {
    tasks.push({
      kind,
      collection,
      id: entry.id,
      title: entry.data.title,
      ...(detail === undefined ? {} : { detail }),
    });
  };
  const reviewable: [CollectionName, readonly Reviewable[]][] = [
    ['texts', content.texts],
    ['recordings', content.recordings],
    ['artworks', content.artworks],
    ['videos', content.videos],
  ];
  for (const [collection, entries] of reviewable) {
    for (const entry of entries) {
      if (entry.data.rights === 'pending') {
        add('rights-pending', collection, entry);
      }
      if (entry.data.review !== undefined) {
        add('review', collection, entry, entry.data.review);
      }
    }
  }

  const textsWithRecording = new Set(
    content.recordings.flatMap((recording) => recording.data.texts),
  );
  for (const text of content.texts) {
    if (text.data.kind === 'song' && !textsWithRecording.has(text.id)) {
      add('song-without-recording', 'texts', text);
    }
    if (text.data.provisional) {
      add('provisional-text', 'texts', text);
    }
  }
  for (const recording of content.recordings) {
    const isMusic = recording.data.kind === 'song' || recording.data.kind === 'instrumental';
    if (isMusic && recording.data.texts.length === 0) {
      add('recording-without-text', 'recordings', recording);
    }
  }
  for (const video of content.videos) {
    if (video.data.youtubeId === undefined) {
      add('video-without-youtube', 'videos', video);
    }
  }
  for (const artwork of content.artworks) {
    if (artwork.data.inventoryCode === undefined) {
      add('artwork-without-inventory-code', 'artworks', artwork);
    }
  }
  return tasks;
}

/** Tasks grouped by kind, in display order, each group sorted by title; empty groups omitted. */
export function groupPendingTasks(tasks: readonly PendingTask[]): PendingTaskGroup[] {
  return PENDING_TASK_KINDS.map((kind) => ({
    kind,
    tasks: tasks
      .filter((task) => task.kind === kind)
      .sort((a, b) => collator.compare(a.title, b.title)),
  })).filter((group) => group.tasks.length > 0);
}
