# Fuentes en las aplicaciones Prisma

Prisma y las seis aplicaciones independientes usan el mismo selector, registro local de fuentes y política de nombres de OOXML. La biblioteca aparece como lista; las fuentes esenciales originales disponibles preceden a sus alternativas. Detectar familias instaladas no lee sus archivos: elegir una familia importa únicamente sus variantes.

| Aplicación | Uso y exportación |
| --- | --- |
| Writer y PDF | Texto y estilos; nombres solicitados en documentos DOCX y archivos de fuente reales en PDF. |
| Sheets | Celdas; nombres públicos en XLSX y fuentes locales en la exportación de la hoja a PDF. |
| Slides y Publisher | Texto y tablas, incluidas celdas inicialmente vacías. PPTX conserva nombres, tamaño y estilo; SVG incluye las variantes reales utilizadas. Su exportación PDF actual usa imágenes de las páginas. |
| Data | Fuente de la vista de registros y consultas; preferencia local conservada al reabrir. XLSX guarda la familia y mantiene los demás atributos de las celdas. SQLite, CSV y JSON no contienen tipografía. |

Cuando falta una original, las alternativas incluidas permiten visualizar el texto, conservando el nombre solicitado de OOXML al exportar. Por ejemplo, Arimo se presenta como alternativa a Arial y el archivo de OOXML solicita Arial. Una fuente importada conserva su nombre real. Los archivos XLSX/PPTX no incrustan las fuentes mediante este selector.

En Windows instalado, Prisma ofrece la enumeración del dispositivo. En navegadores compatibles utiliza Local Font Access y su permiso. La importación de TTF, OTF y colecciones es otra opción local. En un teléfono no se presupone que el navegador permita enumerar todas las fuentes del sistema.

El 13 de octubre de 2026 se importaron mediante el selector de archivos las cuatro variantes reales de Arial de este PC en un perfil de prueba web. Data y Sheets exportaron XLSX con Arial; Slides y Publisher exportaron tablas con nombre, tamaño y negrita/cursiva conservados. El SVG de Publisher contenía la variante cursiva original, comprobada por SHA-256. La preferencia de Data permaneció al guardar y reabrir. Los documentos y archivos privados de esa prueba no se distribuyen.

Las pruebas automatizadas están en `tests/suite-fonts.test.ts`, junto con las pruebas existentes del registro, variantes, estilos académicos, incrustación en documentos DOCX/PDF y restauración local. Esta prueba por importación no certifica el diálogo de Chrome/Edge: esa comprobación permanece identificada en `docs/auditoria-prisma.json`.
