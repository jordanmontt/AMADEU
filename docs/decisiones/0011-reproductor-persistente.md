# 0011. Reproductor de audio persistente con cola

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-47 a RF-49, RT-03

## Contexto

La música es central y escuchar no debería interrumpirse al navegar por el sitio.

## Decisión

Un mini-reproductor fijo que sigue sonando entre páginas, con cola de reproducción y la letra visible. Sin sincronización línea por línea en la v1.

## Por qué

Es la experiencia esperada en un archivo musical. Sincronizar las letras exige mucho trabajo manual por canción.

## Alternativas descartadas

Un reproductor por página; letra sincronizada desde la v1.
