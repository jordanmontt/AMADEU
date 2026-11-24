import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import PendingTaskList from './PendingTaskList.astro';

describe('PendingTaskList', () => {
  it('shows each group with its count and links every task to the admin editor', async () => {
    const container = await AstroContainer.create();

    const html = await container.renderToString(PendingTaskList, {
      props: {
        groups: [
          {
            kind: 'review',
            tasks: [
              {
                kind: 'review',
                collection: 'artworks',
                id: 'dibujo-93',
                title: 'Alcalde de la canción',
                detail: 'Confirmar la canción.',
              },
            ],
          },
        ],
      },
    });

    expect(html).toContain('1 pendiente');
    expect(html).toMatch(/<h2 id="tasks-review">Revisar \(1\)<\/h2>/);
    expect(html).toContain('href="/admin/#/collections/artworks/entries/dibujo-93"');
    expect(html).toContain('Imagen: Alcalde de la canción');
    expect(html).toContain('Confirmar la canción.');
  });

  it('says when nothing is pending', async () => {
    const container = await AstroContainer.create();

    const html = await container.renderToString(PendingTaskList, { props: { groups: [] } });

    expect(html).toContain('No hay pendientes.');
  });
});
