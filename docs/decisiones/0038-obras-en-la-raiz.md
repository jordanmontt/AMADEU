# 0038. Las obras viven en la raíz de la URL

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-60, RT-15, RT §7.1

## Contexto

La página de un libro podía vivir directamente después del dominio (`/sangre-y-sueno/`) o bajo un prefijo (`/obras/sangre-y-sueno/`). En ambos casos existe el listado `/obras/`.

## Decisión

Cada obra usa su slug en la raíz: `/<slug-obra>/` y `/<slug-obra>/<slug-texto>/`. Los slugs de obra no pueden coincidir con las rutas reservadas del sitio (`obras`, `escuchar`, `galeria`, `leer`, `videos`, `marcelo`, `buscar`, `admin`, `id`); la CI lo verifica.

## Por qué

Las direcciones son más cortas y fáciles de recordar, y quedan más limpias en el QR y en la contratapa del libro.

## Alternativas descartadas

Obras bajo `/obras/<slug-obra>/`: más ordenado y sin riesgo de colisión, pero con direcciones más largas.
