import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import { aText, aWork } from '../../tests/support/builders';
import WorkContents from './WorkContents.astro';

describe('WorkContents', () => {
  it('renders each section as a labelled heading with links to its texts, in order', async () => {
    const container = await AstroContainer.create();
    const work = aWork('sys', { slug: 'sangre-y-sueno' });
    const section = { id: 'cancionero', title: 'Libro de canciones', slug: 'cancionero', order: 1 };

    const html = await container.renderToString(WorkContents, {
      props: {
        work,
        sections: [
          {
            section,
            texts: [aText('a', { title: 'Cordillera Real' }), aText('b', { title: 'Luna Andina' })],
          },
        ],
      },
    });

    expect(html).toContain('aria-labelledby="section-cancionero"');
    expect(html).toMatch(/<h2 id="section-cancionero"[^>]*>\s*Libro de canciones\s*<\/h2>/);
    expect(html.indexOf('/sangre-y-sueno/cordillera-real/')).toBeLessThan(
      html.indexOf('/sangre-y-sueno/luna-andina/'),
    );
  });

  it('uses the requested heading level for section titles', async () => {
    const container = await AstroContainer.create();
    const section = { id: 'relatos', title: 'Relatos', slug: 'relatos', order: 1 };

    const html = await container.renderToString(WorkContents, {
      props: { work: aWork('sys'), sections: [{ section, texts: [] }], headingLevel: 3 },
    });

    expect(html).toMatch(/<h3 id="section-relatos"/);
    expect(html).toContain('0 textos');
  });
});
