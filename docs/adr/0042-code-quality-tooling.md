# 0042. Code quality tooling and conventions

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RT §3

## Context

Consistent, verifiable code quality for a possible handover.

## Decision

Strict TypeScript (pinned to the 6.0 line, required by `@astrojs/check` and `typescript-eslint`); ESLint (typescript-eslint strict, `eslint-plugin-astro`, jsx-a11y rules); Prettier; `astro check`; Conventional Commits; Node 24 LTS pinned in `.nvmrc` and `engines`; one branch and pull request per milestone.

## Consequences

Widely known tools that a new engineer will recognize; mistakes are caught before review.

## Rejected alternatives

No linting; custom conventions.
