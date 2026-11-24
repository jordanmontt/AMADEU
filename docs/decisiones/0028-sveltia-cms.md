# 0028. Sveltia CMS como panel de administración

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RT-30 a RT-36

## Contexto

El CMS basado en Git tenía que ser gratuito, estar en español y **subir medios directo a R2**.

## Decisión

**Sveltia CMS** en `/admin`, con su almacenamiento nativo de Cloudflare R2. Las subidas van del navegador a R2 sin pasar por GitHub ni por los límites de Pages.

## Por qué

Es gratis (MIT), con mucha actividad, interfaz en español, guía oficial para Astro y campos de relación. Es la única opción gratuita con R2 nativo.

## Alternativas descartadas

Decap CMS (R2 solo en su plan pago o con un widget propio); Pages CMS (medios solo en el repo); TinaCMS y Keystatic (requieren servidor o un plan pago).
