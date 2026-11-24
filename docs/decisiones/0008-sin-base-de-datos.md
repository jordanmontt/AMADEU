# 0008. Sin base de datos: el repositorio es la base de datos

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RT-10

## Contexto

Hacía falta guardar contenido estructurado y editable con costo cero y sin servidores que mantener.

## Decisión

El contenido son archivos Markdown/YAML en `src/content/`, validados por esquemas en la compilación y editados con un CMS basado en Git.

## Por qué

Da historial de cambios y respaldo gratis, no requiere servidor y el mismo contenido sirve para la app Android.

## Alternativas descartadas

Un CMS sin interfaz pública (Directus, Strapi) con su propia base de datos, que requiere servidor; WordPress, que pide más mantenimiento y seguridad.
