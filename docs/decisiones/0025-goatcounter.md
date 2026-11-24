# 0025. Estadísticas con GoatCounter

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-62

## Contexto

Se necesita medir el uso sin cookies y con datos que se puedan mostrar a financiadores.

## Decisión

Se usa **GoatCounter**, con panel público. El QR lleva `?ref=qr`.

## Por qué

Es gratis para uso no comercial, de código abierto y sin cookies, y su panel público se puede compartir.

## Alternativas descartadas

Cloudflare Web Analytics (sin panel público y con 6 meses de retención); Google Analytics (cookies y banner de consentimiento). Riesgo aceptado: GoatCounter lo mantiene una sola persona. Si desaparece, se migra a Cloudflare Web Analytics.
