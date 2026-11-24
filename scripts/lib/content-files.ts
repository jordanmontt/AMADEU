/**
 * Serializes content entries the way the content collections read them: YAML files for
 * data entries, Markdown with YAML frontmatter for texts.
 */
import { parse, stringify } from 'yaml';

const OPTIONS = { lineWidth: 0 } as const;

export function yamlEntry(data: Record<string, unknown>): string {
  return stringify(data, OPTIONS);
}

export function markdownEntry(data: Record<string, unknown>, body: string): string {
  return `---\n${stringify(data, OPTIONS)}---\n${body}`;
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;

/**
 * Sets `primaryRecording` on a text file unless the text already names one, so an
 * editor's choice is never replaced by a later import.
 */
export function withPrimaryRecording(markdown: string, recordingId: string): string {
  const match = FRONTMATTER.exec(markdown);
  if (match === null) {
    throw new Error('Text file without YAML frontmatter');
  }
  const [, frontmatter = '', body = ''] = match;
  const data = parse(frontmatter) as Record<string, unknown>;
  if (data.primaryRecording !== undefined) {
    return markdown;
  }
  return markdownEntry({ ...data, primaryRecording: recordingId }, body);
}
