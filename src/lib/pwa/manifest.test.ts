import { describe, expect, it } from 'vitest';
import { APP_ICONS, webAppManifest } from './manifest';

describe('webAppManifest', () => {
  const manifest = webAppManifest({
    name: 'Archivo Marcelo de Urioste',
    shortName: 'Marcelo de Urioste',
    description: 'Poesía, música y memoria',
  });

  it('installs the whole site as a standalone Spanish app (RF-53)', () => {
    expect(manifest).toMatchObject({
      name: 'Archivo Marcelo de Urioste',
      short_name: 'Marcelo de Urioste',
      lang: 'es',
      start_url: '/',
      scope: '/',
      display: 'standalone',
    });
  });

  it('offers the icon sizes launchers require, including a maskable one', () => {
    expect(manifest.icons.map((icon) => `${icon.sizes} ${icon.purpose}`)).toEqual([
      '192x192 any',
      '512x512 any',
      '512x512 maskable',
    ]);
    expect(APP_ICONS.every((icon) => icon.src.startsWith('/icons/'))).toBe(true);
  });
});
