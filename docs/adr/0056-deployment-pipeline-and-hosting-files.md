# 0056. Deployment from CI, Cloudflare files generated at build, settings from the environment

- **Status:** Accepted
- **Date:** 2026-11-25
- **Requirements:** RF-62, RF-70, RF-71, RT-12, RT-44, RT-50, RT-57

## Context

The site goes to Cloudflare Pages ([ADR 0019](0019-cloudflare-pages-and-domain.md)). Several things are still missing:
- the Foundation's Cloudflare project;
- its domain;
- its GoatCounter site.

What can be prepared without them must not depend on them, and must not publish anything by accident.

## Decision

- **Deployment from GitHub Actions** (RT-57). A `deploy` job runs only on pushes to `main`, and only after the checks and the E2E tests in every browser passed. A failing change publishes nothing and the previous site stays online (RF-71). It uses Cloudflare's `wrangler-action` with:
  - the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`;
  - the repository variables `CLOUDFLARE_PAGES_PROJECT`, `SITE_URL` and `GOATCOUNTER_CODE`.

  While they are missing, the job says so and publishes nothing. Cloudflare's own Git integration is not used, because it would publish without waiting for the tests.
- **Settings from the environment.** `SITE_URL` gives the sitemap, canonical links and shared images their absolute addresses; without it they are left out. `PUBLIC_GOATCOUNTER_CODE` turns visit counting on; without it nothing is counted.
- **Cloudflare files generated at build** (a dynamic route, since Astro ignores page files starting with `_`):
  - `_headers`: security headers; cache rules for hashed files, the service worker and audio; no indexing of the admin;
  - `_redirects`: a 301 for every permanent link. The static redirect pages stay for other hosts and the Android app.
- **GoatCounter**, counted from `astro:page-load` with the script's own counting turned off. Every page is counted once, including pages reached by client-side navigation, which the script alone would miss.
- **Tests never reach outside hosts:** Playwright sends every host but the test server to a proxy that does not exist. Intercepting routes was the first try, but in Firefox any route makes navigations skip the service worker, which broke the offline tests.

## Consequences

- Connecting the Foundation's accounts is configuration only, listed step by step in [docs/deployment.md](../deployment.md). No code changes.
- Each deploy builds the site again in the `deploy` job, about two minutes, instead of moving the checked build between jobs: simpler, and the build is deterministic.
- The E2E build sets `SITE_URL` and a GoatCounter code, so absolute addresses and counting are tested; the counter script is replaced by a stand-in in those tests.

## Rejected alternatives

- **Cloudflare Pages' Git integration:** it builds and publishes on every push, whether or not the tests pass.
- **Hard-coding the prototype's `*.pages.dev` address:** the project name is not chosen yet, and the domain will replace it.
- **Blocking outside hosts with intercepted routes:** it breaks the service worker in Firefox.
