# 0030. Imágenes optimizadas al subirlas; originales en Internet Archive

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-67, RT-23

## Contexto

Sin mosaicos IIIF, las imágenes solo necesitan una versión web de buena calidad.

## Decisión

Al subir una imagen, el admin la convierte a WebP de unos 2400 px antes de enviarla a R2. Los TIFF originales los sube la Fundación a Internet Archive y la ficha guarda el enlace. **Falta verificar** que la transformación funcione con R2; si no, una GitHub Action se encarga de redimensionar.

## Por qué

No requiere servidor y la persona del admin no hace nada técnico.

## Alternativas descartadas

Pedirle al editor que prepare las imágenes a mano; un flujo con Action que genere mosaicos.
