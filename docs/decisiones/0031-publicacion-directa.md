# 0031. Publicación directa sin aprobación

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-70, RF-71, RT-35

## Contexto

Se podía publicar al guardar o pasar por un flujo de borrador, revisión y publicación.

## Decisión

Lo que se guarda en el admin se publica directo. La CI impide publicar contenido inválido.

## Por qué

Es más simple para un equipo muy pequeño. El historial de Git permite revertir cualquier cambio.

## Alternativas descartadas

El flujo editorial de Sveltia, con ramas y pull requests.
