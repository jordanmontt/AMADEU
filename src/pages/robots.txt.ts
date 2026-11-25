/**
 * robots.txt (RT-44): everything public except the admin, permanent links and raw audio.
 */
import type { APIRoute } from 'astro';
import { robotsTxt } from '../lib/seo';

export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt(site), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
