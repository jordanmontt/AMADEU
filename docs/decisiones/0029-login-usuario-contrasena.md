# 0029. Login del admin con usuario y contraseña (Sveltia CMS Additions)

- **Estado:** aceptada
- **Fecha:** 2026-11-24
- **Requerimientos:** RF-65, RT-31

## Contexto

El editor no sabe de informática. La alternativa era crearle una cuenta de GitHub.

## Decisión

Se despliega **Sveltia CMS Additions** en un Worker gratuito de Cloudflare: el editor entra con usuario y contraseña, y la clave de R2 la configura el administrador una sola vez.

## Por qué

Es mucho más simple para el editor y no expone credenciales.

## Alternativas descartadas

Login con GitHub mediante el Worker sveltia-cms-auth, que exige cuenta de GitHub y que cada navegador ingrese la clave de R2.
