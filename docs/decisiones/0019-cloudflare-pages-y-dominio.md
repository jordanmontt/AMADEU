# 0019. Cloudflare Pages y dominio de la Fundación

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RT-52, RT §11

## Contexto

Hacía falta hosting gratuito y un dominio permanente para el QR. La Fundación todavía no tiene dominio.

## Decisión

Cloudflare Pages en la misma cuenta que R2. El dominio se compra en Cloudflare Registrar a nombre de la Fundación (previsto `marcelodeurioste.org`). El prototipo se publica primero en `*.pages.dev` y el dominio se conecta después.

## Por qué

Un solo proveedor gratuito, un dominio a precio de costo y la propiedad en manos de la Fundación.

## Alternativas descartadas

Vercel o Netlify (otro proveedor aparte de R2); un dominio a nombre del desarrollador.
