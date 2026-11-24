# 0021. Provisional text from Tomo I until the canonical text exists

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-21, RF-22, RF-58

## Context

The canonical text of *Sangre y Sueño* is being prepared and will have **a different order and different titles** for many poems. The only digital text is Tomo I of *El Regocijo de Vivir* (Plural, 2012).

## Decision

Load Tomo I marked `provisional: true`, citing its edition, with an optional critical-notes field. Each text is replaced from the admin when the canonical version arrives.

## Consequences

The prototype can be built without waiting for the final text.

## Rejected alternatives

Wait for the canonical text.
