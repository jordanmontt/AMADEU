# 0018. Astro + PWA; Android con el mismo proyecto empaquetado con Capacitor

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RT-03, RT-60 a RT-62

## Contexto

El sitio tenía que ser estático, ligero y fácil de mantener, y permitir reutilizar el código para Android.

## Decisión

**Astro** con salida estática, TypeScript y PWA. Para Android se usará el mismo proyecto compilado con un filtro de obra y empaquetado con **Capacitor**. Astro no compila a Android; Capacitor mete el sitio dentro de una app nativa.

## Por qué

Envía casi cero JavaScript, tiene colecciones de contenido con esquemas y permite una sola base de código para web y Android.

## Alternativas descartadas

Next.js (más pesado y orientado a servidor); app nativa en Kotlin o Flutter (otra base de código); TWA (requiere conexión y mostraría todo el sitio).
