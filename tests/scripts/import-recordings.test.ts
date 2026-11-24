import { describe, expect, it } from 'vitest';
import { withPrimaryRecording } from '../../scripts/lib/content-files';
import { audioFileName, needsConversion, recordingData } from '../../scripts/lib/import-recordings';
import { recordingSchema } from '../../src/lib/content/schemas';

const item = {
  source: '000 ARCHIVO MARCELO 2/Audios Marcelo/Cordillera Real.mp3',
  id: 'cordillera-real-casera',
  title: 'Cordillera Real',
  kind: 'song',
  texts: ['cordillera-de-los-andes'],
  collection: 'Grabación casera',
  date: '1993/1995',
  rights: 'cleared' as const,
};

describe('recording import', () => {
  it('names the published audio after the entry id', () => {
    expect(audioFileName(item)).toBe('cordillera-real-casera.mp3');
  });

  it('converts only non-MP3 sources', () => {
    expect(needsConversion(item)).toBe(false);
    expect(needsConversion({ ...item, source: 'Videos/America.mp4' })).toBe(true);
  });

  it('builds a valid recording entry with a rounded duration and only the given fields', () => {
    const data = recordingData(item, 131.6);

    expect(data).toEqual({
      title: 'Cordillera Real',
      texts: ['cordillera-de-los-andes'],
      kind: 'song',
      date: '1993/1995',
      collection: 'Grabación casera',
      durationSeconds: 132,
      audio: 'cordillera-real-casera.mp3',
      rights: 'cleared',
    });
    expect(recordingSchema.safeParse(data).success).toBe(true);
  });
});

describe('withPrimaryRecording', () => {
  const text = '---\ntitle: Madre\nrights: cleared\n---\nverso\n';

  it('adds the primary recording to a text that has none, keeping its body', () => {
    expect(withPrimaryRecording(text, 'madre-casera')).toBe(
      '---\ntitle: Madre\nrights: cleared\nprimaryRecording: madre-casera\n---\nverso\n',
    );
  });

  it("keeps an editor's existing choice", () => {
    const chosen = '---\ntitle: Madre\nprimaryRecording: otra\n---\nverso\n';

    expect(withPrimaryRecording(chosen, 'madre-casera')).toBe(chosen);
  });

  it('rejects a file without frontmatter', () => {
    expect(() => withPrimaryRecording('verso', 'x')).toThrow(/frontmatter/);
  });
});
