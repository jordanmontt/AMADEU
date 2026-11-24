# Documentation / Documentación

| Document | Language | Audience | Contents |
|---|---|---|---|
| [01 – Requerimientos funcionales](01-requerimientos-funcionales.md) | Español | Fundación, editores, financiadores | Qué es la aplicación, qué contiene y cómo se ve. |
| [Inventario del archivo](inventario/README.md) | Español | Fundación, editores | Material digitalizado existente y pendientes de contenido. |
| [02 – Technical requirements](02-technical-requirements.md) | English | Engineers | Stack, content model, media, CMS, routes, quality, deployment. |
| [Architecture](architecture.md) | English | Engineers | arc42 + C4 views: context, containers, components, data flows, deployment. |
| [Architecture Decision Records](adr/README.md) | English | Engineers | One file per decision, with context and rejected alternatives. |
| [CONTRIBUTING](../CONTRIBUTING.md) | English | Engineers | Setup, commands, testing, conventions, release. |
| [GLOSSARY](../GLOSSARY.md) | English | Everyone | Project terms (work, section, record, permalink…). |

## Conventions

- Language split ([ADR 0039](adr/0039-language-split.md)): Foundation-facing documents are in **Spanish**; everything technical (code, comments, tests, technical docs, ADRs, commit messages) is in **English**. The site UI, admin labels and public URLs are in Spanish.
- Requirements have IDs: `RF-…` (functional) and `RT-…` (technical). Cite them in issues, pull requests and tests.
- When a decision changes, add a new ADR that supersedes the old one. Never delete an ADR.

## Context sources outside the repository

The parent folder of the repository holds reference material that is **not** versioned:

- `Requerimientos/Propuesta de contenidos de la aplicación.pdf`: the original proposal for the Foundation.
- `Archivos Digitales/`: the digitized archive (~6.6 GB extracted).
- `Logos/`: current logos (WhatsApp photos only).
