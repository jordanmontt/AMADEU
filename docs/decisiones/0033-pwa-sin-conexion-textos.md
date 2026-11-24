# 0033. PWA: textos sin conexión, medios en línea

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-53, RF-54, RT-40

## Contexto

La PWA podía cachear todo o solo una parte.

## Decisión

Se precachean la estructura, los textos, las fichas y el índice de búsqueda. El audio y el video requieren conexión.

## Por qué

Funciona sin señal para leer sin inflar el almacenamiento del teléfono.

## Alternativas descartadas

Descarga de audio para escuchar sin conexión (se deja para Android).
