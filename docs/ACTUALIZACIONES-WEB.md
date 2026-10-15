# Actualizaciones de la página instalada

La aplicación instalada y la página comparten el mismo motor de actualización.
Al abrir con conexión, la navegación consulta la página publicada. Si la conexión
falla, tarda más de seis segundos o devuelve un error, conserva la página de la
última instalación completa.

El service worker instala primero HTML, JavaScript, CSS y recursos de presentación.
Los motores WASM, diccionarios, sonidos y modelos de voz no bloquean ese paso.
Se guardan al utilizarlos o mediante «Instalar app → Descargar todo para usar sin
conexión». La interfaz distingue la aplicación instalada de la biblioteca completa.
Los modelos neuronales descargados se conservan en su propia base de datos.

En Lore, «Audiolibro → Preparar audiolibro sin conexión» descarga el código de
la aplicación, el motor, pronunciación y biblioteca de efectos mediante una
lista cerrada del service worker. También conserva los modelos requeridos por
todos los capítulos y personajes, incluidos cambios de idioma dentro de un
capítulo. Comprueba la generación de cada modelo antes de mostrar que terminó.
En EXE/APK los recursos y dos modelos españoles están incluidos desde el primer
inicio. Otros modelos requieren una primera descarga. Cambiar a una voz o idioma
nuevos puede requerir preparar de nuevo; la generación no utiliza un servidor TTS.

La página recuerda una actualización aunque se active antes de abrir un editor.
«Actualizar» guarda el proyecto antes de recargar. Una actualización no fuerza
la recarga de un manuscrito abierto. Al volver a primer plano o recuperar conexión,
se vuelve a comprobar el service worker, con un mínimo de un minuto entre consultas.

Los cambios de caché afectan únicamente a archivos públicos de la aplicación.
Nunca borran IndexedDB, documentos, historias, audios importados ni preferencias.
Una instalación incompleta conserva el código de la versión anterior.

Regresión comprobada: Lore 1.1.0 podía permanecer en una caché antigua y ocultar
las voces neuronales de 1.2.0. La instalación dependía de todos los recursos
esenciales, incluidos motores grandes; una descarga fallida impedía activarla.
Las pruebas cubren la instalación con un motor no disponible, recuperación sin
conexión, errores HTTP, cuotas, reutilización de recursos y aviso de actualización
entre pantallas. La navegación online no reemplaza el HTML offline por el de otra
publicación hasta que su instalación termina.
