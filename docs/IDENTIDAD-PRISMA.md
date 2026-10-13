# Iconos de la familia Prisma

Las marcas de Writer, Sheets, Slides, Data, Publisher y Prisma siguen el acabado del logo original de PDF: base oscura redondeada, luz superior, sombras suaves, papel plegado y facetas. Cada aplicación conserva un símbolo propio y un color reconocible. Los SVG son originales de OscarD0823, sin imágenes ni fuentes externas.

`public/*-logo.svg` es la fuente de los iconos web, Apple, Windows y Android. El monograma del repositorio `logo.svg` coincide con `public/prisma-logo.svg`. El logo de PDF conserva su diseño.

Para regenerar las seis marcas y sus exportaciones, con Sharp instalado o `PRISMA_SHARP_PATH` apuntando a una instalación existente:

```powershell
node scripts/brand-marks.mjs
foreach ($kind in @('writer','sheets','slides','data','publisher','prisma')) {
  node scripts/brand-assets.mjs "--$kind"
}
node scripts/pwa-icons.mjs
node scripts/android-suite-icons.mjs
```

Las exportaciones incluyen PNG de 192, 512 y 1024 px, Apple de 180 px, ICO con siete tamaños entre 16 y 256 px, PWA adaptable y cinco densidades Android. Las variantes adaptables dejan el símbolo principal dentro del área segura. El antiguo comando Python de Writer delega en el mismo SVG para evitar un segundo diseño.

Los recursos se publican desde el núcleo compartido en los siete sitios. El hash del service worker cambia al cambiar los iconos. La portada `OscarD0823/Pagina-Principal` utiliza copias idénticas de los siete SVG y actualiza su propia caché. Los instaladores nativos incorporan estos recursos al recompilarse; cambiar un PNG en el repositorio no modifica por sí solo un EXE o APK instalado.
