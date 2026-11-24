/**
 * The web app manifest (RF-53, RT-40, ADR 0052): what a phone shows when the site is
 * installed as an app. Served at /manifest.webmanifest by src/pages/manifest.webmanifest.ts.
 */

export interface AppIcon {
  readonly src: string;
  readonly sizes: string;
  readonly type: 'image/png';
  readonly purpose: 'any' | 'maskable';
}

export interface WebAppManifest {
  readonly name: string;
  readonly short_name: string;
  readonly description: string;
  readonly lang: string;
  readonly start_url: string;
  readonly scope: string;
  readonly display: 'standalone';
  readonly background_color: string;
  readonly theme_color: string;
  readonly icons: readonly AppIcon[];
}

/** The paper white of the site (`--paper`): the splash screen and the browser bar. */
export const APP_BACKGROUND = '#ffffff';

/**
 * The installable icons, written by scripts/pwa/icons.ts into public/icons/. Maskable icons
 * keep the drawing inside the central 80 % that every launcher shape leaves visible.
 */
export const APP_ICONS: readonly AppIcon[] = [
  { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];

export function webAppManifest(strings: {
  name: string;
  shortName: string;
  description: string;
}): WebAppManifest {
  return {
    name: strings.name,
    short_name: strings.shortName,
    description: strings.description,
    lang: 'es',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: APP_BACKGROUND,
    theme_color: APP_BACKGROUND,
    icons: APP_ICONS,
  };
}
