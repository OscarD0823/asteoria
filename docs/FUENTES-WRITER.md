# Fuentes de Writer 1.6.2

- La biblioteca muestra una lista, con nombre, muestra, procedencia y favoritas. En pantallas pequeñas la búsqueda, los resultados y la importación permanecen accesibles con el teclado. La muestra completa está en las opciones de vista previa.
- Arial, Calibri, Times New Roman, Cambria, Georgia, Courier New y Aptos originales tienen prioridad cuando están leídos en este dispositivo o incluidos en el proyecto. Enumerar una fuente instalada no equivale a importar sus archivos.
- Aplicar un formato académico utiliza la original disponible. Si ya se concedió la enumeración y se encontró la familia solicitada, el clic en el formato lee esa familia y la incorpora al proyecto; cuando falta o no se puede utilizar, se conserva la alternativa compatible. No se consulta un servidor de documentos o fuentes privadas.
- DOCX solicita Arial, Calibri, Times New Roman, Cambria, Georgia o Courier New para sus alternativas conocidas. Los archivos alternativos conservan sus nombres reales en la tabla de fuentes; `w:altName` permite resolverlos cuando falta la original. Importar, reconstruir y exportar mantiene el nombre solicitado. PDF usa los archivos disponibles, por lo que abrir un DOCX en un equipo con otra fuente puede cambiar la composición.

Esta política se apoya en la [especificación de nombres alternativos de Microsoft](https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing.altname?view=openxml-3.0.1). Los accesos académicos siguen las [opciones de fuentes publicadas por APA](https://www.apa.org/ed/precollege/psn/2020/09/apa-style-student-papers); la plantilla institucional puede especificar otra opción.

## Comprobaciones del 13 de octubre de 2026

En el Samsung SM-S721B físico, Android 16, Writer 1.6.1 abrió el DOCX de prueba, aplicó Calibri, permitió escribir y exportó un proyecto con 17/17 variantes originales idénticas por SHA-256. Las actualizaciones de prueba 1.6.2 reabrieron el proyecto sin perder texto o fuentes. La prueba detectó el recorte de las muestras y dio lugar a la lista actual. El teléfono se desconectó antes de repetir la prueba con la compilación final y exportar PDF desde ella; esas comprobaciones físicas siguen pendientes. No se cambió la conectividad del teléfono.

En la interfaz web de desarrollo se verificaron las primeras filas sin recortes con viewport 411 × 479, los originales al inicio y Times New Roman original al aplicar APA. Las pruebas automatizadas comprueban cuerpo, títulos, leyendas, índices, referencias y el ciclo DOCX con fuentes alternativas. Los archivos originales y las capturas de prueba permanecen privados en `D:\PDF\Pruebas`.

FNT-001 sigue abierto: falta comprobar permitir, cancelar y reintentar en la interfaz de Chrome/Edge. La verificación visual de Windows y los ensayos de emulador se documentan por separado en la auditoría. No se afirma que todos los navegadores o celulares permitan enumerar fuentes del sistema.

La entrega [Writer 1.6.2](https://github.com/OscarD0823/prisma-pdf/releases/tag/writer-v1.6.2) ya está publicada con EXE, APK, código fuente y sumas. Los tamaños y SHA-256 de los cuatro archivos coinciden con GitHub. Windows está instalado en `D:\Prisma\Prisma Writer` y pasó el arranque de prueba; el paquete instalado coincide con el compilado. La APK final está instalada en el Samsung con el certificado existente. El teléfono volvió a conectarse, pero quedó bloqueado antes de completar la repetición final de la interfaz y PDF. Se solicitó al usuario desbloquearlo; no se introdujo ni sorteó su PIN.

La edición de definiciones de estilos de párrafo y las asociaciones para abrir archivos desde Windows/Android están registradas como solicitudes adicionales pendientes. También se registraron [siete alertas de dependencias](DEPENDENCIAS-PENDIENTES.md) encontradas al revisar GitHub. Se conserva la instrucción de completar un punto antes de pasar al siguiente.
