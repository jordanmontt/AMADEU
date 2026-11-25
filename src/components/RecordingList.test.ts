import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import { aRecording } from '../../tests/support/builders';
import { parseTracks } from '../lib/player/track';
import RecordingList from './RecordingList.astro';

/** The player buttons of the rendered list, with the tracks each one hands to the player. */
function playerButtons(
  html: string,
): { action: string; label: string; ids: string[]; start: string }[] {
  const decode = (value: string): string =>
    value.replaceAll('&quot;', '"').replaceAll('&#34;', '"').replaceAll('&amp;', '&');
  return [...html.matchAll(/<button[^>]*data-player-action="([^"]+)"[^>]*>/g)].map(
    ([tag, action]) => {
      const attribute = (name: string): string =>
        decode(new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1] ?? '');
      return {
        action: action ?? '',
        label: attribute('aria-label'),
        ids: parseTracks(attribute('data-player-tracks')).map((track) => track.id),
        start: attribute('data-player-start'),
      };
    },
  );
}

const lp = aRecording('lp', { title: 'Cordillera Real', audio: 'lp.mp3' });
const home = aRecording('home', { title: 'Luna Andina', audio: 'home.mp3' });

describe('RecordingList', () => {
  it('plays each version of a song on its own and can add it to the queue', async () => {
    const container = await AstroContainer.create();

    const html = await container.renderToString(RecordingList, {
      props: { recordings: [lp, home], label: 'Grabaciones', textHref: '/sys/cordillera-real/' },
    });

    expect(playerButtons(html)).toEqual([
      { action: 'play', label: 'Escuchar «Cordillera Real»', ids: ['lp'], start: '0' },
      { action: 'enqueue', label: 'Agregar «Cordillera Real» a la cola', ids: ['lp'], start: '0' },
      { action: 'play', label: 'Escuchar «Luna Andina»', ids: ['home'], start: '0' },
      { action: 'enqueue', label: 'Agregar «Luna Andina» a la cola', ids: ['home'], start: '0' },
    ]);
    expect(html).toContain('/sys/cordillera-real/');
    expect(html).not.toContain('<audio');
  });

  it('plays a continuous list on from the chosen recording', async () => {
    const container = await AstroContainer.create();

    const html = await container.renderToString(RecordingList, {
      props: { recordings: [lp, home], label: 'Grabación casera', continuous: true },
    });
    const plays = playerButtons(html).filter((button) => button.action === 'play');

    expect(plays.map(({ ids, start }) => ({ ids, start }))).toEqual([
      { ids: ['lp', 'home'], start: '0' },
      { ids: ['lp', 'home'], start: '1' },
    ]);
  });

  it('gives each track the page of the text it is a version of', async () => {
    const container = await AstroContainer.create();
    const texts = new Map([['lp', [{ title: 'Cordillera Real', href: '/sys/cordillera-real/' }]]]);

    const html = await container.renderToString(RecordingList, {
      props: { recordings: [lp, home], label: 'Escuchar', texts },
    });
    const tracks = [...html.matchAll(/data-player-tracks="([^"]*)"/g)].map(
      ([, json]) => parseTracks((json ?? '').replaceAll('&quot;', '"').replaceAll('&#34;', '"'))[0],
    );

    expect(tracks[0]?.href).toBe('/sys/cordillera-real/');
    expect(tracks[2]).not.toHaveProperty('href');
    expect(html).toMatch(
      /Versión de\s*<a href="\/sys\/cordillera-real\/"[^>]*>Cordillera Real<\/a>/,
    );
  });
});
