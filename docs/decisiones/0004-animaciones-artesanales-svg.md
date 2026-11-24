# 0004. Dibujos animados de forma artesanal con SVG

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-50 a RF-52

## Contexto

Se quiere que algunos dibujos se animen, por ejemplo el hombre que toca la guitarra. Las opciones eran: un trazo que se dibuja solo, partes que se mueven, o un video generado (con IA o por un animador).

## Decisión

En la v1 se animan 2 o 3 dibujos vectorizados (Potrace/Inkscape), separados en capas y animados con CSS o Web Animations. Las animaciones combinan el trazo que se dibuja solo con partes que se mueven, se sincronizan con la música cuando tiene sentido y las hace el desarrollador. La primera es «Alcalde de la canción» (`93.tif`).

## Por qué

Es ligero, respeta el trazo original, no requiere licencias como After Effects y queda bajo control del proyecto.

## Alternativas descartadas

Lottie con After Effects (licencia de pago); video generado por IA (más pesado y menos fiel al trazo); animar todos los dibujos (inviable para la v1).
