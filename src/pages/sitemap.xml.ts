/**
 * The sitemap of every public page (RT-44). Empty when the site's address is unknown.
 */
import type { APIRoute } from 'astro';
import { catalog } from '../data/catalog';
import { sitemapPaths, sitemapXml } from '../lib/seo';

export const GET: APIRoute = async ({ site }) =>
  new Response(sitemapXml(site, sitemapPaths(await catalog())), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
