# 0009. Medios pesados fuera de GitHub: R2, YouTube e Internet Archive

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RT-20 a RT-26

## Contexto

El archivo pesa unos 6,6 GB: 3,8 GB de video, 2,45 GB de TIFF y 400 MB de audio. GitHub bloquea archivos de más de 100 MB y recomienda repos de menos de 1 GB. Cloudflare Pages limita cada archivo a 25 MiB.

## Decisión

Los videos van a **YouTube**. El audio y las imágenes web van a **Cloudflare R2**: 10 GB gratis y sin costo por tráfico de salida. Los originales de preservación van a **Internet Archive**. GitHub solo guarda código y texto.

## Por qué

Es gratis o casi gratis, YouTube adapta la calidad del video a cada conexión e Internet Archive asegura la preservación a largo plazo.

## Alternativas descartadas

Guardar los medios en GitHub o Git LFS (límites y costos); alojar el video en R2 (sin streaming adaptativo y con más peso); usar Google Drive (no sirve para reproducir en la web).
