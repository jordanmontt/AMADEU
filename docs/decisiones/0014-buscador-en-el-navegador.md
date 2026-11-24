# 0014. Buscador estático en el navegador (Pagefind)

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-35, RF-36

## Contexto

Hace falta un buscador sin servidor y que también funcione sin conexión.

## Decisión

Se usa **Pagefind**, que genera el índice en la compilación. El índice se precachea en la PWA.

## Por qué

Es gratis, no necesita servidor, es rápido y funciona sin conexión.

## Alternativas descartadas

Algolia (servicio externo con límites); un buscador propio en un servidor.
