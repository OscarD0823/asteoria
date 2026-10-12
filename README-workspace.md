# Un entorno, siete repositorios

`OscarD0823/prisma` contiene el panel general, el núcleo común, las dependencias, las fuentes y diccionarios abiertos, los motores locales y la configuración para web, Windows y Android. Cada aplicación tiene su código en su repositorio: `prisma-pdf`, `prisma-writer`, `prisma-sheets`, `prisma-slides`, `prisma-data` y `prisma-publisher`.

Prisma importa directamente sus módulos. PDF y Writer comparten el espacio de edición documental; Slides y Publisher comparten el motor de presentaciones. Las plantillas de Publisher pertenecen a su repositorio. Las dependencias se declaran con importaciones `@prisma/<programa>/<módulo>`; no se copia el editor dentro de la suite.

## Preparar el entorno

```powershell
git clone https://github.com/OscarD0823/prisma.git
cd prisma
node scripts/workspace.mjs sync
pnpm install --frozen-lockfile
pnpm dev
```

Node 22 y pnpm 11.25.0. `sync` clona los commits de `workspace.lock.json` dentro de `.prisma/apps/`. `node scripts/workspace.mjs sync --latest` obtiene cambios publicados sin sobrescribir trabajo sin confirmar. Puedes enlazar un checkout existente con `node scripts/workspace.mjs sync --use sheets=D:\ruta\prisma-sheets`; `.prisma-local.json` guarda esta preferencia fuera de Git.

Abre `prisma.code-workspace` para ver los siete repositorios en una ventana. Por ejemplo, `.prisma/apps/sheets/src/Sheets.tsx` pertenece a `prisma-sheets`, y las dos versiones de Sheets lo utilizan.

## Comprobar y compilar

```powershell
pnpm test
node scripts/workspace.mjs validate
pnpm build:product sheets
pnpm build:products
```

`build:product` admite los seis editores y `prisma`. La salida predeterminada `dist-pages` debe estar vacía; `PRISMA_OUTDIR` permite elegir otra carpeta. `build:products` conserva `dist`, `dist-writer`, etc. para los instaladores y genera `dist-site` con las rutas antiguas.

Cada versión suelta tiene una entrada exclusiva. Prisma carga el editor solicitado. Los motores y componentes compartidos necesarios se incluyen como dependencias.

## Publicar una función

1. Edita el programa y comprueba las pruebas.
2. Confirma sus cambios con Git en el repositorio correspondiente.
3. Ejecuta `pnpm workspace:publish sheets`, o el nombre del editor modificado.

El comando sube Sheets, actualiza su commit fijado, sube Prisma y solicita ambas publicaciones. Si modificas el núcleo, confírmalo y ejecuta `pnpm workspace:publish prisma`: solicita las siete publicaciones. Requiere Git y GitHub CLI autenticados; no guarda credenciales en el código.

Se publica la revisión confirmada en la rama `main` del repositorio correspondiente, también si empezaste desde el commit fijado por `sync`. No se fuerza una actualización ni se sobrescriben cambios remotos divergentes: Git detiene la publicación hasta resolverlos.

Un push directo publica el programa. Las páginas comprueban cambios cada 15 minutos: Prisma recoge cambios de los editores y estos recogen cambios de sus dependencias. GitHub puede retrasar las ejecuciones programadas. Se comparan commits antes de descargar dependencias y compilar. `workspace-build.json` registra la procedencia y huella de los módulos utilizados.

## Distribución

Se conservan los identificadores, las URLs y los enlaces de los instaladores actuales. Los nuevos EXE/APK se construyen desde este entorno con `electron-builder*.yml` y los sabores Android existentes. Publicar código web no genera ni instala automáticamente un nuevo EXE/APK: hay que compilar, firmar, comprobar y publicar una versión. Las claves de firma siguen fuera de Git.

## Fuentes del dispositivo

La biblioteca ofrece **Buscar fuentes instaladas**. En navegadores que implementan Local Font Access, el usuario autoriza la lectura de la lista. Solo se leen los archivos de la familia que selecciona; las familias no se suben a servidores. PDF/Writer las incluyen en el proyecto. Sheets/Slides/Publisher guardan las fuentes elegidas en una biblioteca del dispositivo y conservan el nombre real al exportar a Office; PDF y SVG utilizan los archivos seleccionados cuando pueden incrustarse.

Los navegadores móviles y otros navegadores sin esa API permiten elegir TTF/OTF y colecciones TTC/OTC mediante **Importar**. Cambria y Cambria Math se extraen como caras independientes conservando tablas y métricas. Writer recupera las fuentes incrustadas autorizadas de un DOCX y las guarda con el proyecto. El código de Windows solicita confirmación local mediante el preload antes de enumerar; esta mejora requiere un instalador nuevo para llegar a las aplicaciones ya instaladas. Se mantienen la validación, los límites de tamaño y los permisos de incrustación. Las variantes que no pueden utilizarse muestran su motivo. No se afirma acceso automático a todas las fuentes del celular.

La revisión secuencial está en [COMPROBACIONES.md](docs/COMPROBACIONES.md). FNT-001 sigue abierto hasta completar los criterios de web, Windows y Android emulado; las pruebas de integración de fuentes usan archivos reales del dispositivo y permanecen fuera del repositorio público.

El código descargable incluye los módulos de las seis aplicaciones, sus commits y `workspace-source.json`. Se puede reconstruir sin historia de Git. No se empaquetan documentos privados, cachés personales ni claves. Esta reorganización no cambia IndexedDB, los perfiles nativos ni el procesamiento local de documentos.
