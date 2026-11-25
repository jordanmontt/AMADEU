import { describe, expect, it } from 'vitest';
import { youtubeEmbedUrl } from './youtube';

describe('youtubeEmbedUrl', () => {
  it('uses the privacy-enhanced domain and starts playing, since it loads after a click', () => {
    expect(youtubeEmbedUrl('abcdefghijk')).toBe(
      'https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0',
    );
  });
});
