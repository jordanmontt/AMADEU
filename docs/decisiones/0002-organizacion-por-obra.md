# 0002. Organización por obra, con vistas por tipo de medio

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-05 a RF-08

## Contexto

La propuesta original organizaba la app por tipo de medio: Escuchar, Galería, Leer y Archivo sonoro. Con varios libros en el futuro, ese esquema no muestra la relación entre un poema, su canción y sus dibujos.

## Decisión

La columna vertebral es la **obra → secciones → textos**. Escuchar, Galería y Leer funcionan como vistas transversales con filtros. Los videos tienen su propia sección porque no están ligados a los poemas.

## Por qué

Reúne en un solo lugar todo lo que corresponde a cada poema y sirve igual para las obras futuras.

## Alternativas descartadas

Organización solo por tipo de medio, como en la propuesta original.
