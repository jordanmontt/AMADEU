# 0022. ID permanente, títulos alternativos, orden explícito y redirecciones

- **Estado:** aceptada; la parte de redirecciones fue reemplazada por la [0037](0037-enlace-permanente-por-id.md)
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-58, RT-11 a RT-13, RT §7.2

## Contexto

El canónico cambiará los títulos y el orden de los poemas, así que el título no puede servir de identidad.

## Decisión

Cada entrada tiene un `id` inmutable, y todas las relaciones lo usan. El slug se deriva del título y puede cambiar. `altTitles` guarda los títulos anteriores y de otras fuentes, y el buscador los encuentra. El campo `order` es explícito. Un historial de slugs genera redirecciones 301 automáticas, y `/id/<id>/` es una ruta permanente para citar.

## Por qué

Los cambios editoriales no rompen enlaces ni relaciones.

## Alternativas descartadas

Usar el título o el slug como identidad.
