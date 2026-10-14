# Modelos y formatos propios de Prisma


Prisma desarrolla sus propios modelos de documentos, hojas, presentaciones, bases de datos y publicaciones. Los paquetes de la suite no incorporan ejecutables, DLL, controles ni diccionarios propietarios de otras suites de edición.

La interfaz presenta las funciones y los formatos con nombres de Prisma: documento DOCX, libro XLSX, presentación PPTX, proyecto Prisma y base SQLite. Se retiraron comparaciones comerciales de los botones, pantallas iniciales, mensajes y opciones de exportación. Las familias instaladas conservan sus nombres originales porque son parte del formato del documento y de las reglas tipográficas elegidas por el usuario.

El motor de PC usa los mismos importadores de Prisma que los editores web. Verifica DOCX/DOCM, XLSX/XLSM y PPTX/PPTM, devuelve el original intacto y ofrece TXT para el texto representado de documentos/presentaciones y CSV para los valores calculados de la primera hoja del libro. TXT/CSV no contienen diseño, imágenes o macros. Los proyectos de macros incrustados se conservan inactivos al devolver el original. Los motores de otras suites y sus ejecutables de conversión ya no se buscan ni se ejecutan; el API rechaza sus identificadores.

Los editores permiten más salidas mediante sus exportadores existentes: PDF, DOCX, XLSX, PPTX, SVG, HTML, ODT, ODS, RTF, Markdown, TXT y CSV, según la aplicación. Esto no implica que el complemento de PC convierta todos esos formatos entre sí.

Bibliotecas generales como docx (Dolan Miu), ExcelJS (Guyon Roche), PptxGenJS (Brent Ely), fflate, PDF.js, PDF-lib, HyperFormula y sql.js son proyectos abiertos independientes. Mantienen sus licencias. TypeScript es una herramienta de desarrollo bajo Apache-2.0; no es un motor de documentos. La autoría de una biblioteca licenciada no se cambia al crear un adaptador propio.

Los espacios de nombres XML, MIME, códigos de fuentes y claves antiguas de almacenamiento son contratos técnicos. Se mantienen para conservar los archivos y las bibliotecas ya guardadas. Las licencias completas, los avisos de copyright y los archivos SOURCE.json de datos abiertos siguen incluidos. Los documentos originales del usuario pueden contener metadatos de su aplicación de origen, que se conservan al devolver el original.

La comprobación incluye rechazo de conectores retirados, conservación idéntica de XLSM con partes de macros y una segunda hoja, cálculo de fórmulas al exportar CSV, preservación de PPTX y autenticación/aislamiento del complemento local. La detección real de fuentes en Edge se documenta en la auditoría; no se declara una prueba de cancelación del permiso que no se observó.
