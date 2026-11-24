# 0017. Estado de derechos por pieza; solo se publica lo autorizado

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-57, RT-51

## Contexto

Hay material de terceros: TVB, Discolandia, Pro-Audio, Radio Cristal, Montgomery County y Plural.

## Decisión

Cada pieza tiene un campo `rights` (`cleared`/`pending`/`restricted`). La compilación excluye todo lo que no esté `cleared`. La Fundación gestiona las autorizaciones en paralelo.

## Por qué

Evita problemas legales sin bloquear el lanzamiento.

## Alternativas descartadas

Esperar a tener todas las autorizaciones para lanzar.
