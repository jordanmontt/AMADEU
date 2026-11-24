# 0029. Admin login with username and password (Sveltia CMS Additions)

- **Status:** Accepted; the R2 credentials part is superseded by [0044](0044-media-in-the-repository.md)
- **Date:** 2026-11-24
- **Requirements:** RF-65, RT-31

## Context

The editor is not technical. The alternative was creating a GitHub account for them.

## Decision

Deploy **Sveltia CMS Additions** on a free Cloudflare Worker: the editor logs in with a username and password, and the R2 key is configured once by the administrator.

## Consequences

Much simpler for the editor and keeps credentials out of their hands.

## Rejected alternatives

GitHub login via the sveltia-cms-auth Worker (requires a GitHub account and entering the R2 key in every browser).
