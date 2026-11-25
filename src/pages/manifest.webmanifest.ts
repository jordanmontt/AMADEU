/**
 * The web app manifest, built from the UI strings (RF-53, ADR 0052).
 */
import type { APIRoute } from 'astro';
import { es } from '../i18n/es';
import { webAppManifest } from '../lib/pwa/manifest';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      webAppManifest({
        name: es.site.name,
        shortName: es.site.shortName,
        description: es.site.tagline,
      }),
    ),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
