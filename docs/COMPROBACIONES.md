# Comprobaciones de Prisma

Fuente: [Crear Suite Ofimática Web](https://chatgpt.com/share/6acd06a0-bec4-83e9-bccf-68cec5cae0be). Recuperada el 12 de octubre de 2026.

Estado inicial: **FNT-001 — fuentes reales del PC, en curso**. Los 130 puntos del chat están pendientes de comprobación individual. Tener código o conservar un componente de Office no demuestra equivalencia de edición.

Alcance activo solicitado: **Prisma Writer**, el reemplazo de Word. Se termina FNT-001 en Writer y después se aborda AUD-053, paginación, seguido de los demás puntos de Writer en su orden original. Los puntos de las otras aplicaciones conservan sus identificadores y su estado pendiente. Solo Writer recibe esta nueva versión de los instaladores mientras se comprueba el punto actual.

Un solo punto activo: reproducir → revisar → corregir → probar → publicar y verificar → cerrar. No se abre el siguiente mientras falte un criterio del actual. Una dependencia externa mantiene el punto abierto; no se omite. Windows y web se prueban realmente; Android en emulador. La prueba física se documenta por separado.

Cada entrada de [auditoria-prisma.json](auditoria-prisma.json) conserva un identificador y su posición en la fuente. Los títulos siguientes son resúmenes; la descripción completa permanece en el chat enlazado. Los criterios y evidencias se completan al trabajar cada punto.

## Antes de la auditoría

- [ ] FNT-001 — Enumerar las fuentes del PC, usar las variantes originales, guardar y reabrir, comprobar PDF y formatos Office, publicar web y probar/installar Windows y Android.

## PDF: conservación y edición

- [ ] **AUD-001 · P0** — Evitar reconstrucciones innecesarias cuando no hay cambios reales.
- [ ] **AUD-002 · P0** — Conservar formularios, anotaciones, vínculos, marcadores, adjuntos, metadatos y firmas al modificar PDF.
- [ ] **AUD-003 · P0** — Detectar firmas digitales y evitar invalidarlas silenciosamente.
- [ ] **AUD-004 · P0** — Sustituir texto existente conservando su apariencia.
- [ ] **AUD-005 · P0** — Evitar daños en texto cercano, superpuesto, girado, tablas y columnas.
- [ ] **AUD-006 · P0** — Proteger formularios interactivos y explicar cualquier aplanamiento.
- [ ] **AUD-007 · P1** — Editar párrafos completos con varios estilos y redistribución.
- [ ] **AUD-008 · P1** — Exportar resaltados, subrayados y dibujos como anotaciones PDF nativas.
- [ ] **AUD-009 · P1** — Investigar y comprobar guardado incremental.
- [ ] **AUD-010 · P1** — Recuperar el original y la última versión válida cuando falla una exportación.

## PDF: herramientas

- [ ] **AUD-011 · P0** — Editar texto conservando fuente, posición, espaciado, interletraje, alineación, tamaño, color y saltos.
- [ ] **AUD-012 · P1** — Detectar párrafos y columnas sin tapar otros elementos al añadir texto.
- [ ] **AUD-013 · P1** — Recortar, sustituir, girar, alinear, distribuir y ajustar opacidad y superposición de imágenes.
- [ ] **AUD-014 · P1** — Comentarios PDF nativos con respuestas, autor, fechas y estados.
- [ ] **AUD-015 · P1** — Sellos personalizados, fechas y sellos propios.
- [ ] **AUD-016 · P1** — Crear, editar, mover y eliminar marcadores compatibles con Acrobat.
- [ ] **AUD-017 · P1** — Crear y conservar enlaces a páginas, archivos y direcciones web.
- [ ] **AUD-018 · P1** — Crear campos de formulario, listas, casillas, botones y validaciones.
- [ ] **AUD-019 · P1** — Manejar o advertir sobre XFA y campos especiales no admitidos.
- [ ] **AUD-020 · P1** — Abrir con contraseña válida y conservar permisos y protección.
- [ ] **AUD-021 · P1** — Firmas digitales auténticas: certificados, validación y PAdES.
- [ ] **AUD-022 · P1** — Redacción efectiva y comprobación de que el contenido no puede recuperarse.
- [ ] **AUD-023 · P1** — Comparar texto, imágenes y diseño de dos PDF.
- [ ] **AUD-024 · P1** — Etiquetas de página, números Bates, encabezados y pies por rangos.
- [ ] **AUD-025 · P2** — Administrar adjuntos y portafolios PDF.
- [ ] **AUD-026 · P2** — Gestionar capas PDF y su visibilidad.
- [ ] **AUD-027 · P2** — Generar y validar PDF/A, PDF/UA y PDF/X.

## OCR

- [ ] **AUD-028 · P1** — Ampliar idiomas y detectar el idioma automáticamente.
- [ ] **AUD-029 · P1** — Reconstruir tablas, columnas y párrafos.
- [ ] **AUD-030 · P1** — Corregir rotaciones e inclinación antes de reconocer.
- [ ] **AUD-031 · P1** — Procesar documentos extensos por lotes con memoria limitada.
- [ ] **AUD-032 · P1** — Corregir el texto OCR junto a la imagen original.
- [ ] **AUD-033 · P1** — Conservar el orden de lectura al exportar escaneos a Word.
- [ ] **AUD-034 · P2** — Reconocer formularios, casillas y tablas complejas.
- [ ] **AUD-035 · P2** — Reconocer escritura manuscrita mediante un motor local.

## Herramientas comunes

- [ ] **AUD-036 · P0** — Abrir, Guardar y Guardar como directamente en archivos locales.
- [ ] **AUD-037 · P0** — Atajos Ctrl+S/O/P/Z/Y/F, F2 y propios de cada editor.
- [ ] **AUD-038 · P0** — Selección precisa con ratón, teclado, tacto y múltiples objetos.
- [ ] **AUD-039 · P0** — Copiar y pegar texto enriquecido, tablas, formatos e imágenes entre Office y Prisma.
- [ ] **AUD-040 · P1** — Menús contextuales pertinentes para cada selección.
- [ ] **AUD-041 · P1** — Herramientas contextuales para imágenes y tablas.
- [ ] **AUD-042 · P1** — Portapapeles entre Writer, Sheets y Slides.
- [ ] **AUD-043 · P1** — Pegado especial de valores, formato, texto, imágenes y vínculos.
- [ ] **AUD-044 · P1** — Recuperación automática tras cierre inesperado o falta de batería.
- [ ] **AUD-045 · P1** — Historial de versiones locales.
- [ ] **AUD-046 · P1** — Reglas, guías, cuadrículas y medidas predecibles.
- [ ] **AUD-047 · P1** — Zoom porcentual, ajustar al ancho/página y desplazamiento continuo.
- [ ] **AUD-048 · P1** — Arrastrar archivos, imágenes, tablas, páginas, diapositivas y elementos.
- [ ] **AUD-049 · P1** — Buscar comandos por su nombre o finalidad.
- [ ] **AUD-050 · P1** — Accesibilidad por teclado, lectores de pantalla, contraste, foco y áreas táctiles.
- [ ] **AUD-051 · P2** — Personalizar barras, atajos, cinta, temas y preferencias.
- [ ] **AUD-052 · P2** — Gestos móviles de selección, desplazamiento, zoom y control de objetos.

## Writer

- [ ] **AUD-053 · P0** — Paginación equivalente a Word: líneas, tablas, saltos, encabezados y pies.
- [ ] **AUD-054 · P0** — Fuentes y métricas: originales, interlineado, kerning, ligaduras y sustituciones conocidas.
- [ ] **AUD-055 · P1** — Control de cambios con inserciones, eliminaciones, aceptar y rechazar.
- [ ] **AUD-056 · P1** — Comparar y combinar versiones de documentos.
- [ ] **AUD-057 · P1** — Tablas con fórmulas, encabezados repetidos, bordes, división y autoajuste.
- [ ] **AUD-058 · P1** — Imágenes delante/detrás del texto y ajuste cuadrado, estrecho, superior e inferior.
- [ ] **AUD-059 · P1** — Campos dinámicos, referencias cruzadas, propiedades, índices y numeración.
- [ ] **AUD-060 · P1** — Notas al pie y al final con edición y paginación equivalentes.
- [ ] **AUD-061 · P1** — Ecuaciones editables interoperables mediante OMML.
- [ ] **AUD-062 · P1** — Listas y numeración DOCX nativas.
- [ ] **AUD-063 · P1** — Controles de contenido, desplegables, casillas y campos rellenables.
- [ ] **AUD-064 · P1** — Combinar correspondencia, cartas y etiquetas con hojas de cálculo.
- [ ] **AUD-065 · P1** — Corrección gramatical, concordancia, puntuación y estilo local.
- [ ] **AUD-066 · P2** — Intercambiar bibliografía editable con Word.
- [ ] **AUD-067 · P2** — Estilos jerárquicos/vinculados y plantillas DOTX.

## Sheets

- [ ] **AUD-068 · P0** — Hojas grandes y libros complejos con renderizado virtualizado.
- [ ] **AUD-069 · P0** — Fórmulas, datos, errores, fechas y resultados equivalentes a Excel.
- [ ] **AUD-070 · P0** — Matrices dinámicas, derrames, referencias estructuradas y funciones modernas.
- [ ] **AUD-071 · P1** — Gráficos nativos editables de barras, líneas, sectores, dispersión y combinados.
- [ ] **AUD-072 · P1** — Tablas y gráficos dinámicos.
- [ ] **AUD-073 · P1** — Tablas estructuradas con filtros, totales, estilos y referencias.
- [ ] **AUD-074 · P1** — Formato condicional con barras, escalas, fórmulas e iconos.
- [ ] **AUD-075 · P1** — Validación de datos, mensajes y listas.
- [ ] **AUD-076 · P1** — Autorrelleno de fórmulas, series, fechas y patrones.
- [ ] **AUD-077 · P1** — Ordenamiento y filtrado multicriterio y por formato.
- [ ] **AUD-078 · P1** — Nombres definidos y referencias externas.
- [ ] **AUD-079 · P1** — Conservar y posteriormente editar tablas y conexiones Power Query localmente.
- [ ] **AUD-080 · P1** — Buscar objetivo, escenarios y resolución de problemas.
- [ ] **AUD-081 · P1** — Áreas de impresión, títulos repetidos, saltos y escalado.
- [ ] **AUD-082 · P1** — Libros protegidos y respeto de permisos.
- [ ] **AUD-083 · P2** — Conservar VBA y automatización local con autorización.

## Slides

- [ ] **AUD-084 · P0** — Representación PPTX precisa en textos, objetos, tamaños, colores y posiciones.
- [ ] **AUD-085 · P1** — Patrones, diseños heredados, marcadores de posición y temas.
- [ ] **AUD-086 · P1** — Animaciones de entrada, énfasis, salida y trayectorias con tiempos y desencadenadores.
- [ ] **AUD-087 · P1** — Transiciones avanzadas representables localmente.
- [ ] **AUD-088 · P1** — Agrupar, desagrupar, alinear y distribuir objetos.
- [ ] **AUD-089 · P1** — SmartArt editable: organigramas, procesos, ciclos y jerarquías.
- [ ] **AUD-090 · P1** — Gráficos vinculados a hojas de cálculo.
- [ ] **AUD-091 · P1** — Insertar, reproducir y conservar audio y vídeo.
- [ ] **AUD-092 · P1** — Notas y vista del presentador.
- [ ] **AUD-093 · P1** — Grabar narración y tiempos de presentación.
- [ ] **AUD-094 · P1** — PDF vectorial con texto seleccionable.
- [ ] **AUD-095 · P2** — Plantillas POTX y diseños empresariales.

## Data

- [ ] **AUD-096 · P0** — Importar y exportar ACCDB/MDB conservando la información.
- [ ] **AUD-097 · P1** — Diseñador de formularios y controles.
- [ ] **AUD-098 · P1** — Diseñador de informes imprimibles.
- [ ] **AUD-099 · P1** — Relaciones e integridad referencial comparables a Access.
- [ ] **AUD-100 · P1** — Consultas Access y conversión controlada a SQLite.
- [ ] **AUD-101 · P2** — Módulos y macros con ejecución local segura compatible.

## Publisher

- [ ] **AUD-102 · P0** — Lectura y conversión real del formato PUB.
- [ ] **AUD-103 · P1** — Marcos de texto enlazados entre páginas.
- [ ] **AUD-104 · P1** — Páginas maestras y plantillas editoriales.
- [ ] **AUD-105 · P1** — Imposición para impresión comercial.
- [ ] **AUD-106 · P1** — Sangrados, marcas de corte, color y exportación profesional.

## Arquitectura compartida

- [ ] **AUD-107 · P1** — Prisma File Engine: abrir, guardar, recuperar y gestionar documentos locales.
- [ ] **AUD-108 · P1** — Prisma Compatibility Engine: importar, exportar y preservar componentes desconocidos.
- [ ] **AUD-109 · P1** — Prisma Rendering Engine: fuentes, colores, métricas, imágenes y paginación.
- [ ] **AUD-110 · P1** — Prisma Clipboard Engine: portapapeles interno y externo.
- [ ] **AUD-111 · P1** — Prisma History Engine: deshacer, rehacer, recuperación y versiones.
- [ ] **AUD-112 · P1** — Prisma Printing Engine: vista previa, papel, márgenes, escalado y PDF vectorial.
- [ ] **AUD-113 · P1** — Prisma UI System: cinta, menús, ventanas y paneles consistentes.
- [ ] **AUD-114 · P1** — Prisma Diagnostics: detectar incompatibilidad y avisar antes de guardar.
- [ ] **AUD-115 · P1** — Prisma Plugin API: extensiones locales.
- [ ] **AUD-116 · P1** — Prisma Security Engine: permisos, macros, archivos, cifrado y protección.

## Pruebas generales

- [ ] **AUD-117 · P1** — Abrir documentos creados en Office.
- [ ] **AUD-118 · P1** — Comparar la apariencia Office/Prisma.
- [ ] **AUD-119 · P1** — Editar y guardar con Prisma.
- [ ] **AUD-120 · P1** — Reabrir con Office.
- [ ] **AUD-121 · P1** — Comprobar objetos, fórmulas, notas, estilos y metadatos conservados.
- [ ] **AUD-122 · P1** — Repetir el ciclo Office → Prisma → Office varias veces.
- [ ] **AUD-123 · P1** — Comparar resultados de fórmulas con Excel.
- [ ] **AUD-124 · P1** — Comparar posiciones y apariencia PowerPoint/Slides.
- [ ] **AUD-125 · P1** — Conservar íntegro un PDF no modificado.
- [ ] **AUD-126 · P1** — Verificar formularios, vínculos, firmas y anotaciones tras editar PDF.
- [ ] **AUD-127 · P1** — Comprobar eliminación efectiva de contenido redactado.
- [ ] **AUD-128 · P1** — Archivos grandes, dañados, protegidos y con elementos desconocidos.
- [ ] **AUD-129 · P1** — Windows, Android, navegadores y dispositivos de distintas capacidades.
- [ ] **AUD-130 · P1** — Detectar errores de memoria, cierres y pérdida de archivos locales.

## Pedidos adicionales

Los estilos académicos, índices, citas, ortografía multilingüe, caracteres, plantillas y demás pedidos de esta conversación se adjuntarán como casos a los puntos correspondientes. Dominio, donaciones y expediente de autoría tienen entradas adicionales; no se compran ni se registran cuentas inventadas.

