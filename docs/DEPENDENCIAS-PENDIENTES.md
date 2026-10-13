# Corrección de dependencias del 13 de octubre de 2026

La revisión comenzó con siete alertas de GitHub: cinco altas y dos moderadas. Esta actualización sustituye las copias que las originaron, conservando las APIs utilizadas por Prisma. El estado remoto actual se consulta en [Dependabot](https://github.com/OscarD0823/prisma/security/dependabot); una prueba de funciones por sí sola no demuestra su cierre.

| Copia anterior | Consumidores | Corrección |
| --- | --- | --- |
| nanoid 2.1.11, cuatro alertas | hunspell-asm 4.0.2 y emscripten-wasm-loader 3.0.3 | nanoid 3.3.20; imports CJS y ESM adaptados a su exportación nombrada. Ambos consumidores conservan el generador de nombres internos de tamaño fijo 45. |
| image-size 1.2.1, dos alertas | pptxgenjs 4.0.1 | image-size 2.0.3. ICNS/JXL de longitud cero terminan con error y PNG válido conserva dimensiones; las pruebas de exportación de presentaciones pasan. |
| sprintf-js 1.1.3, una alerta | roarr → global-agent 3 → @electron/get 3.1.0 de las herramientas de empaquetado | global-agent 4.1.3 elimina Roarr y sprintf-js de esa ruta. Se adaptó la conservación de las opciones TLS y del host, y la comparación de puertos predeterminados en NO_PROXY. |

Pasaron cinco pruebas específicas de dependencias y 165 pruebas del entorno completo. Se comprobaron conexiones HTTP y HTTPS reales en loopback con certificados del ensayo, rechazo de nombre incorrecto y exclusiones del proxy. No se desactivó la validación TLS ni se modificaron almacenes de confianza del usuario. Los once diccionarios locales, la conservación de documentos Office y las siete compilaciones web permanecen operativos.

Las pruebas están en `tests/dependency-security.test.mjs`; los overrides y los tres parches se registran en `pnpm-workspace.yaml`. El código fuente descargable incluye `patches/`, comprobado en el tar real.

Un investigador independiente examinó los consumidores y un revisor independiente probó el candidato. La revisión detectó la regresión de NO_PROXY con puertos explícitos 80/443; se corrigió y se añadieron controles. No se ha demostrado explotación desde documentos Prisma para cada aviso ni se ha realizado un análisis completo de seguridad. El borde `customAlphabet('ab',0)(1)` de nanoid 3.3.20 sigue siendo problemático fuera de los consumidores examinados; Prisma no llama a esa API. global-agent 4 también elimina los diagnósticos del logger Roarr predeterminado.

Avisos primarios: [generadores de nanoid](https://github.com/advisories/GHSA-2v37-7h3g-55p8), [análisis de imágenes](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq), [precisión de sprintf-js](https://github.com/advisories/GHSA-hp3w-g68c-fv3c). No se han ocultado ni descartado alertas.
