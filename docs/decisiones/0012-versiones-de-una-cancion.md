# 0012. Una versión principal y otras versiones de cada canción

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-17

## Contexto

Una canción puede tener varias grabaciones: el LP de 1984, la grabación casera y un recital.

## Decisión

Cada texto tiene una `primaryRecording`. Las demás grabaciones enlazadas aparecen como «Otras versiones», con su procedencia.

## Por qué

Es claro para quien escucha y riguroso para el archivo.

## Alternativas descartadas

Mostrar solo una versión, o todas sin jerarquía.
