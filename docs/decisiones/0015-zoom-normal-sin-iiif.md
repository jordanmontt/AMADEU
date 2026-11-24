# 0015. Zoom normal en la galería; zoom profundo (IIIF) para el futuro

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-27

## Contexto

Primero se pidió zoom profundo desde la v1. Luego se decidió que no hacía falta todavía, porque la galería solo tiene dibujos.

## Decisión

La v1 muestra imágenes WebP de unos 2400 px con zoom y desplazamiento. El zoom profundo por mosaicos IIIF queda para versiones futuras.

## Por qué

Menos almacenamiento y ningún paso extra en la carga: no hay que generar mosaicos.

## Alternativas descartadas

IIIF estático con libvips y OpenSeadragon desde la v1.
