# Estado y pendientes de Prisma — 13 de octubre de 2026

Revisión del chat «Crear Suite Ofimática Web» y del código real. Se recuperó la auditoría completa mediante el enlace compartido. Sus 130 puntos están registrados individualmente en [COMPROBACIONES.md](COMPROBACIONES.md) y [auditoria-prisma.json](auditoria-prisma.json). Se conserva su orden; primero se trabaja en FNT-001, fuentes reales del PC, y no se inicia el siguiente punto mientras siga abierto.

## Resuelto ahora

- Código propio en seis repositorios y un entorno común en `prisma`.
- Una sola implementación utilizada por la suite y cada programa independiente.
- Entrada de compilación por aplicación y carga diferida de editores.
- Commits fijados, validación de propietarios, procedencia de las compilaciones y actualización periódica al cambiar sus dependencias.
- Conservación de URLs, identificadores y enlaces de los instaladores.
- Código para buscar fuentes instaladas, leer la familia elegida e importar TTF/OTF/TTC. Se comprobaron 225 familias y 488 caras reales mediante Chromium, con 17 variantes de Arial, Calibri, Times New Roman, Cambria y Cambria Math. Los bytes de esas 17 caras coinciden en las exportaciones PDF y DOCX; XLSX/PPTX mantienen nombres y estilos. Writer 1.6.1 está publicado e instalado en Windows; Android se comprobó en emulador, incluido guardar y reabrir sin conexión. El diálogo real de Windows superó cancelar, reintentar y permitir; detectó 225 familias y se aplicó Arial. FNT-001 continúa abierto por la interacción de permisos en Chrome/Edge: el navegador integrado no expone el diálogo y el control nativo de Edge no pudo verificar su URL. Las fuentes variables y los formatos o permisos no compatibles muestran el motivo; no se anuncia acceso universal a cualquier fuente.

## Compatibilidad con Office: pendientes

| Programa | Comprobado | Falta para una equivalencia con Office |
| --- | --- | --- |
| Writer | DOCX/DOCM, títulos, índices y enlaces, tablas, citas y secciones; pruebas con Word | Fidelidad de paginación y fuentes, campos complejos, revisión y correspondencia completas, DOC heredado y pruebas con más documentos |
| Sheets | XLSX/XLSM, LET y nombres; 69 resultados comparados con Excel; macros BAS de celdas | VBA completo, UDF, formularios, eventos y proyectos binarios; LAMBDA, matrices dinámicas y referencias estructuradas completas; tablas dinámicas, Power Query y gráficos avanzados |
| Slides | PPTX/PPTM, texto, imágenes, tablas, notas, plantillas y conservación de partes | Animaciones, SmartArt, multimedia, temas y diseños complejos, edición de grupos y accesibilidad |
| Data | SQLite, tablas, relaciones, consultas, transacciones y exportaciones | ACCDB/MDB nativos, formularios, informes y automatización equivalentes a Access |
| Publisher | Plantillas y composición por páginas; salida PPTX/PDF/SVG | PUB nativo, cajas encadenadas, maquetación editorial, preimpresión y gestión de color |
| PDF | Texto y objetos, OCR, páginas, unión, exportación, impresión y proyectos locales | Fuentes incrustadas y documentos complejos; formularios y accesibilidad completos; comprobar retirada de contenido en censura; firmas digitales verificables |
| Todos | PWA, Windows y Android; recursos abiertos y ortografía multilingüe | Pruebas físicas en más móviles; gramática y división silábica avanzadas; corpus público de pruebas Office |

El soporte no es del 100 %. Conservar una parte del archivo no significa poder editarla o ejecutarla. La comparación de VBA cubre el subconjunto implementado. Los ejercicios originales de los chats no pudieron recuperarse; las comparaciones existentes usan archivos sintéticos identificados en informes locales.

## Gratuidad, dominio y crecimiento

Prisma sigue siendo gratuito y procesa documentos en el dispositivo. Más usuarios incrementan la descarga de la aplicación y sus recursos; los cálculos se hacen en cada equipo. Las aplicaciones conservan sus ámbitos de caché y sus identidades.

GitHub Pages sirve los sitios estáticos actuales. Admite hasta 1 GB por sitio publicado y tiene un límite flexible de transferencia de 100 GB al mes; el límite flexible de diez compilaciones por hora no se aplica a flujos personalizados de Actions. [Límites oficiales de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

Queda pendiente medir transferencia y peso por editor, ampliar recursos opcionales bajo demanda, probar conexiones lentas y preparar CDN o migración si el uso lo requiere. No se puede garantizar capacidad masiva sin mediciones. El dominio y sus DNS se configurarán cuando exista uno; no se ha comprado dominio ni alojamiento.

El enlace de donación necesita una URL elegida por el autor; no se inventa una cuenta ni se condicionan funciones al pago. También falta definir cómo quiere registrar legalmente el software. Licencia, autoría e historia de Git acompañan el código, pero no equivalen por sí solas a un trámite de registro.

## Orden recomendado

1. Ampliar pruebas de ida y vuelta Office y corregir pérdidas de contenido.
2. Mejorar fórmulas XLSX, paginación DOCX y representación PPTX.
3. Ampliar tablas, gráficos, revisión y maquetación sobre motores comprobados.
4. Extender automatización con límites explícitos y pruebas.
5. Desarrollar Access/Publisher propios y formatos heredados.
6. Medir rendimiento y distribución en equipos y móviles reales.

Autor: [OscarD0823](https://github.com/OscarD0823). AGPL-3.0-or-later, con licencias separadas para recursos abiertos.
