/**
 * The files Cloudflare Pages reads from the built site (ADR 0056): `_headers` (cache and
 * security headers) and `_redirects` (permanent links answered by the server). A dynamic
 * route, because Astro ignores page files whose name starts with an underscore.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { catalog } from '../data/catalog';
import { HEADERS, redirects } from '../lib/hosting';

export const getStaticPaths = (() => [
  { params: { hostingFile: '_headers' } },
  { params: { hostingFile: '_redirects' } },
]) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) =>
  new Response(
    params.hostingFile === '_headers' ? HEADERS : redirects((await catalog()).permalinks()),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
