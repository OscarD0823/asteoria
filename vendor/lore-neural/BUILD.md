# Pronunciación neuronal local

Los archivos piper_phonemize.js/.wasm/.data se conservan sin modificaciones de diffusionstudio/piper-wasm, commit 022edba0455ef024574747e1134ef893f1d71b76. El módulo ES agrega únicamente export default createPiperPhonemize durante la preparación.

Fuentes preferidas C/C++ y diccionarios incluidos en sources: piper-phonemize (wide-video) y rhasspy/espeak-ng, con sus licencias originales. La receta original de compilación con Emscripten 3.1.47 está en BUILD-UPSTREAM.md. El proveedor no identifica el commit exacto de cada entrada con el que produjo el binario publicado; se conserva la revisión de phonemize vigente en junio de 2024 y la revisión de eSpeak fijada por su CMake. No se afirma una reconstrucción bit a bit.

ONNX Runtime Web 1.30.0 se instala desde el lockfile (MIT). JS y WASM deben tener idéntica versión. Se usa un Worker, WASM SIMD, un hilo y una sesión de voz activa para contener memoria.

Modelos: revisión inmutable c10ece1aade47bb51c153c893d14e5bf8e5b7117 de rhasspy/piper-voices. models.json fija URL, tamaño y SHA-256 del archivo LFS original. model-cards conserva cada ficha; licencias de conjuntos de datos se respetan adicionalmente a MIT del repositorio. Se excluyen modelos con datos NC o licencia sin determinar.

Paola: su dataset declara CC0-1.0 en https://huggingface.co/datasets/paolapersico1/Voice-Dataset-Italian. Daniela: SLR61, Google 2018/2019, CC-BY-SA-4.0, entrenada por larcanio y ajustada a partir de Lessac. No se modifica el modelo ni se distribuye como creación de ASTEORIA.
