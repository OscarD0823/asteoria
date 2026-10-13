# Alertas de dependencias revisadas el 13 de octubre de 2026

GitHub informa siete alertas abiertas en el entorno general: cinco altas y dos moderadas. Una publicación correcta o las pruebas de funciones no cierran estas alertas.

| Dependencia fijada | Ruta observada en el archivo de dependencias | Alertas | Estado |
| --- | --- | --- | --- |
| nanoid 2.1.11 | hunspell-asm 4.0.2 y emscripten-wasm-loader 3.0.3 | 3 altas, 1 moderada | Se debe actualizar la dependencia manteniendo la API que usan sus consumidores. nanoid 3.3.20 también está instalado; eso no sustituye la copia 2.1.11. |
| image-size 1.2.1 | pptxgenjs 4.0.1 | 2 altas | Los avisos indican 2.0.3 como primera versión corregida. El cambio de versión mayor requiere comprobar las llamadas de la exportación de imágenes/presentaciones. |
| sprintf-js 1.1.3 | roarr 2.15.4, dependencia opcional de herramientas | 1 moderada | El aviso no declara versión corregida. Queda pendiente verificar sus consumidores y sustituir o limitar el uso si corresponde. |

Fuentes: [generadores de nanoid](https://github.com/advisories/GHSA-2v37-7h3g-55p8), [análisis de imágenes](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq), [precisión de sprintf-js](https://github.com/advisories/GHSA-hp3w-g68c-fv3c). La lista completa y su estado actual están en [Dependabot del repositorio](https://github.com/OscarD0823/prisma/security/dependabot).

Se identificaron paquetes y versiones mediante la API de GitHub y `pnpm-lock.yaml`. No se ejecutaron archivos maliciosos en documentos del usuario ni se ha demostrado aquí la explotación de cada alerta en Prisma. No se ocultaron ni descartaron los avisos y no se hicieron cambios de versión sin comprobar su compatibilidad. La corrección sigue pendiente y no forma parte de las 155 pruebas de funciones superadas en Writer 1.6.2.
