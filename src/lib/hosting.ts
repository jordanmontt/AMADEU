/**
 * Files Cloudflare Pages reads from the built site (ADR 0056): `_headers` (cache and
 * security headers) and `_redirects` (permanent links answered by the server).
 */
import type { Permalink } from './catalog';

/**
 * Headers for every response, then per path:
 * - hashed build files never change, so browsers keep them a year;
 * - the service worker must always be checked for updates;
 * - audio changes rarely but may be replaced, so a week;
 * - the admin is never indexed.
 */
export const HEADERS = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  X-Frame-Options: SAMEORIGIN

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/sw.js
  Cache-Control: no-cache

/audio/*
  Cache-Control: public, max-age=604800

/admin/*
  X-Robots-Tag: noindex, nofollow
`;

/**
 * One permanent redirect per permanent link (RT-12): `/id/<id>/` → the entry's current
 * page. Cloudflare answers them before any page; the static redirect pages under /id/ stay
 * as a fallback for other hosts and the Android app.
 */
export function redirects(permalinks: readonly Permalink[]): string {
  return permalinks.map((link) => `${link.path} ${link.target} 301`).join('\n') + '\n';
}
