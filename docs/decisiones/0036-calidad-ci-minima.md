# 0036. Calidad mínima automatizada en CI

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-71, RT-50

## Contexto

Hay un solo desarrollador y un editor sin conocimientos técnicos que publica directo.

## Decisión

En cada cambio, una Action valida los tipos y los esquemas, comprueba las referencias, compila y revisa los enlaces antes de desplegar. Si algo falla, no se publica.

## Por qué

Protege el sitio de errores del editor con muy poco costo de mantenimiento.

## Alternativas descartadas

Ninguna validación; una suite de pruebas extensa.
