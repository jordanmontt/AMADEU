# 0021. Texto provisional del Tomo I hasta que exista el canónico

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-21, RF-22, RF-58

## Contexto

El texto canónico de *Sangre y Sueño* está en elaboración y tendrá **otro orden y otros títulos** para muchos poemas. El único texto digital disponible es el Tomo I de *El Regocijo de Vivir* (Plural, 2012).

## Decisión

Se carga el Tomo I marcado `provisional: true`, con su edición citada y un campo opcional de notas críticas. Cada texto se reemplaza desde el admin cuando llegue el canónico.

## Por qué

Permite construir el prototipo sin esperar el texto definitivo.

## Alternativas descartadas

Esperar al texto canónico.
