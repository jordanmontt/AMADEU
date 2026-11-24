# 0048. Visual identity: "Acuarela" (watercolour)

- **Status:** Accepted; refines [0010](0010-editorial-visual-identity.md)
- **Date:** 2026-11-24
- **Requirements:** RF-45, RF-46

## Context

Two visual directions were built as mockups with real content: **A "Tinta"** (black ink on white, taken from his pen drawings) and **B "Acuarela"** (colours taken from his 1993 New York watercolours). The developer chose B.

## Decision

The palette, type and devices all come from Marcelo's own watercolours:

| Token | Value | Source |
|---|---|---|
| `--paper` | `#ffffff` | the paper of the scans (not cream) |
| `--ink` | `#1f2440` | a night-blue ink for text |
| `--ink-soft` | `#565b78` | secondary text |
| `--sky` | `#cfe1f2` | the washed sky blue |
| `--ochre` | `#d9a046` | the altiplano ochre in "Cordillera Real" |
| `--frame` | `#2f8a55` | the green frame painted around "Cordillera Real" |
| `--flag` | `#b8202b` | the red flag in "Lunita lunita" (hover, emphasis) |

- **Type:** Young Serif for titles (warm, heavy, not a fashion serif); Literata for everything else, including verses (a book face with optical sizes, comfortable for long reading). Both are self-hosted with Fontsource: no requests to Google, and they work offline in the PWA.
- **Signature device:** the hand-painted **green frame**. It frames artworks and the main cards; dashed for works that are not published yet.
- **Colour bands:** each text page opens with an ochre band holding its title; the home page opens with a watercolour across the full width.
- **Restraint:** colour comes from the artworks and from those bands; everything else is white and ink. Verses are left-aligned in a column of at most 32 rem.

## Consequences

- Strong first impression for funders; the archive looks like Marcelo's own work, not a template.
- Each future work needs a good watercolour or drawing for its home and cards; otherwise the bands carry the colour.
- Ochre with ink text passes WCAG AA (contrast ≈ 6.7:1); white text must never be set on ochre or sky.

## Rejected alternatives

- **A "Tinta":** sober and easy to keep consistent, but with less colour and impact.
- A cream paper with a terracotta accent: the common default for "literary" sites, unrelated to his work.
