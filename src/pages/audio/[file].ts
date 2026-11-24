/**
 * Publishes the audio of every published recording at `/audio/<file>.mp3` (ADR 0044, 0045).
 * Unpublished recordings' audio is never copied to the site.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { publishedAudio } from '../../data/audio';
import { catalog } from '../../data/catalog';
import type { RecordingEntry } from '../../lib/content/collections';

export const getStaticPaths = (async () => {
  const archive = await catalog();
  return archive.recordings().map((recording) => ({
    params: { file: recording.data.audio },
    props: { recording },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ recording: RecordingEntry }> = async ({ props }) => {
  const bytes = await publishedAudio(props.recording);
  return new Response(new Uint8Array(bytes), { headers: { 'Content-Type': 'audio/mpeg' } });
};
