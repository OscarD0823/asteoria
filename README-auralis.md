# Auralis BETA

Una nueva luz para tus ideas. Creado por [OscarD0823](https://github.com/OscarD0823).

Auralis reúne Scribe, Orbit, Nova, Folio, Nexus, Canvas, Atlas y Lore. Cada aplicación mantiene su repositorio y su página; todas usan los mismos módulos del entorno común.

## Recuperación local

Los editores conservan automáticamente su trabajo en el almacenamiento local del navegador o de la aplicación. Las escrituras se agrupan después de 400 ms y, durante cambios continuos, se intenta guardar como máximo cada dos segundos. El indicador confirma cuándo terminó la escritura. Se intenta completar el guardado al ocultar o cerrar la aplicación y antes de cambiar de herramienta.

Orbit conserva por separado la celda todavía en edición; Nexus conserva SQL, definiciones y formularios pendientes. Recuperar un borrador no ejecuta una consulta ni confirma un registro. Lore conserva los capítulos, personajes, familias y fondos en su biblioteca local. Atlas conserva el proyecto CAD.

Un apagado puede perder cambios posteriores al último guardado completado. Borrar los datos de la aplicación, usar navegación privada o perder el dispositivo puede borrar esa biblioteca. Descarga copias de los proyectos para conservar un respaldo independiente. Los manuscritos y documentos no se suben a servidores para guardarlos.

## Compatibilidad de la migración

Las nuevas copias propias usan `.auralis`, `.auralis-lore`, `.auralis-atlas` y `.auralis-canvas`. Se mantienen los lectores anteriores y las extensiones de intercambio PDF, DOCX, XLSX, PPTX, SQLite y otras ya admitidas. Cambiar el nombre no cambia los formatos estándar ni convierte sus límites de compatibilidad en equivalencia completa.

Los identificadores de las aplicaciones nativas, perfiles, claves de bibliotecas y certificados existentes se conservan. Los repositorios y páginas anteriores siguen disponibles durante la transición. En la web cada página conserva su biblioteca: para trasladar un proyecto a una dirección diferente utiliza Exportar e Importar.

Las voces neuronales funcionan localmente cuando se han instalado o preparado sus modelos. Windows y Android incluyen las dos voces españolas de distribución; las demás requieren una descarga inicial. La web requiere preparar primero sus recursos sin conexión.
