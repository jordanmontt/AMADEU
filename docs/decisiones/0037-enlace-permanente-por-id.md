# 0037. Enlace permanente por ID, sin historial de redirecciones

- **Estado:** aceptada. Reemplaza la parte de redirecciones de la [0022](0022-id-permanente-y-redirecciones.md).
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-40, RF-58, RT-12, RT §7.2

## Contexto

La decisión 0022 preveía un historial de slugs (`slug-history.json`) para redirigir las URLs viejas cuando cambiara el título de un poema. Como la publicación ocurre en una GitHub Action temporal, ese historial tenía que guardarse en el repo con commits automáticos.

Los cambios grandes de título van a ocurrir cuando llegue el texto canónico, probablemente antes de que el sitio se difunda. Además, el QR apunta a la página del libro, que no cambia.

## Decisión

- **No** se guarda historial de slugs y **no** hay commits automáticos. Si cambia el título de una pieza, su URL anterior deja de existir.
- Cada pieza tiene un **enlace permanente `/id/<id>/`** que siempre lleva a su URL actual. Se genera desde cero en cada compilación como una línea de `_redirects` por pieza.
- La ficha muestra ese enlace en «cómo citar».
- Siguen vigentes el resto de la 0022: ID inmutable, títulos alternativos y orden explícito.

## Por qué

Hay menos piezas que mantener y no aparecen commits de un bot en el historial. Cubre el caso importante, que es citar y enlazar de forma estable. Si en el futuro se necesita conservar URLs antiguas, el historial se puede agregar sin rehacer nada.

## Alternativas descartadas

El historial de slugs con commits automáticos de la Action (decisión 0022 original).
