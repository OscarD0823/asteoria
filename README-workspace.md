# Un entorno, nueve repositorios

El repositorio OscarD0823/asteoria contiene el panel general, núcleo, dependencias, fuentes y diccionarios, motores locales y configuraciones web/Windows/Android. Los ocho módulos se enlazan desde asteoria-folio, asteoria-scribe, asteoria-orbit, asteoria-nova, asteoria-nexus, asteoria-canvas, asteoria-atlas y asteoria-lore. Atlas mantiene su implementación en src/architecture del núcleo y una entrada en su repositorio.

## Preparación

~~~powershell
git clone https://github.com/OscarD0823/asteoria.git
cd asteoria
node scripts/workspace.mjs sync
pnpm install --frozen-lockfile
pnpm dev
~~~

Node 22 y pnpm 11.25.0. Abre asteoria.code-workspace. sync utiliza los commits de workspace.lock.json; --latest obtiene cambios confirmados sin sobrescribir trabajo local. --use sheets=D:\ruta\asteoria-orbit enlaza un checkout. .prisma-local.json no se publica. En una extracción Source, sync conserva los módulos incluidos y valida workspace-source.json sin exigir historia Git.

## Pruebas y builds

pnpm test; node scripts/workspace.mjs validate; pnpm build:product sheets.

build:product admite pdf, writer, sheets, slides, data, publisher, architecture, stories y prisma (identificador técnico de la versión general). PRISMA_OUTDIR selecciona una carpeta vacía. build:products crea las nueve salidas dist/dist-*. Todos comparten los mismos módulos; la entrada independiente incluye las dependencias necesarias.

## Publicación

Confirma cambios en el repositorio propietario y ejecuta pnpm workspace:publish sheets desde el núcleo. Se sube el módulo, se fija su commit y se solicita publicación de Orbit y ASTEORIA. Para el núcleo: pnpm workspace:publish prisma solicita las nueve publicaciones. No fuerza ramas ni sobrescribe divergencias remotas.

Un push publica el programa. Las páginas comprueban actualizaciones de los módulos cada 15 minutos, según disponibilidad de GitHub Actions; los commits concretos y la huella se registran en workspace-build.json. EXE/APK necesitan un build nativo firmado y un release prerelease Beta independiente, con versiones propias y sus archivos Source.

## Fuentes, privacidad y migración

Buscar fuentes instaladas usa Local Font Access en navegadores compatibles, con permiso del usuario. Windows solicita permiso local; sólo se utilizan los archivos seleccionados. Donde no hay API, se importan TTF/OTF/TTC/OTC. No se afirma detección automática de todas las fuentes móviles. Se conservan nombres tipográficos, variantes, permisos de incrustación y compatibilidad OOXML. Las fuentes del dispositivo y documentos privados no se publican.

La marca visible es ASTEORIA. Los IDs nativos, perfiles, nombres de schemas y formatos antiguos permanecen por compatibilidad. Las rutas públicas sí cambian; cada herramienta tiene su propia página. Las claves de firma quedan fuera de Git y de Source. Las fuentes propias, parches, licencias y datos se incluyen en Source; el complemento Corresponding-Source fija los motores copyleft y recetas originales. Véase docs/ASTEORIA-BETA.md.
