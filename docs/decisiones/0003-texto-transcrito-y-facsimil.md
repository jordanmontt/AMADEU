# 0003. Texto transcrito como lectura principal y facsímil opcional

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-16, RF-20

## Contexto

Los libros pueden mostrarse como texto o como páginas escaneadas. En el archivo hay texto digital extraíble (Tomo I, 2012), pero no hay ningún escaneo de la edición de 1981.

## Decisión

El texto transcrito es la lectura principal. El facsímil se muestra cuando exista un escaneo.

## Por qué

El texto se lee bien en el teléfono, se puede buscar, es accesible y pesa poco. El facsímil aporta valor de archivo.

## Alternativas descartadas

Mostrar solo el facsímil, o solo el texto.
