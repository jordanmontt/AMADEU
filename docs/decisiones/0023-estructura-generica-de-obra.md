# 0023. Estructura genérica de obra: obra → secciones → textos

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-05, RT §4.2

## Contexto

Las partes y el orden del canónico no están definidos, y vendrán otros libros.

## Decisión

Nada fijo en el código: las secciones son una lista ordenable dentro de cada obra, los textos tienen `section` y `order`, y los medios son colecciones aparte enlazadas por `id`.

## Por qué

El mismo modelo sirve para cualquier libro y la Fundación lo reorganiza desde el admin.

## Alternativas descartadas

Páginas y secciones escritas a mano para *Sangre y Sueño*.
