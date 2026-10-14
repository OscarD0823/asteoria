# Motores incorporados y complementos locales de Prisma

Los modelos y motores de documentos, hojas, presentaciones, PDF, macros y datos son propios de Prisma. Los editores web y los programas instalados usan los mismos módulos. Consulta [la autoría y el alcance](docs/INDEPENDENCIA-PRISMA.md).

## Motor de PC

Prisma verifica DOCX/DOCM, XLSX/XLSM y PPTX/PPTM y devuelve el original intacto. También exporta el texto representado de documentos y presentaciones como TXT y los valores calculados de la primera hoja de un libro como CSV. Estos formatos de texto no contienen el diseño, las imágenes o las macros del original.

La aplicación Windows incorpora el motor. Para vincular la web, ejecuta Prisma con --local-engine; para desarrollo, node engines/server.cjs. El enlace privado utiliza un token por ejecución y el servicio escucha solo en 127.0.0.1. Los editores funcionan por sí mismos sin esta vinculación.

El panel ofrece el motor Prisma y dos complementos opcionales: compresión PDF mediante un servicio local y lectura de proyectos mediante un servicio local. No instala suites de documentos. Los adaptadores retirados no se enumeran ni se ejecutan.

## Recursos abiertos

Los adaptadores propios utilizan bibliotecas generales de formatos, cálculo, renderizado y ortografía. Los diccionarios, fuentes y bibliotecas mantienen su autoría, licencia y procedencia. Las licencias y SOURCE.json están incluidos en los paquetes. Los archivos personales del usuario permanecen en su dispositivo.

## Validación

Las pruebas cubren conservación de partes originales, notas, tablas, imágenes, Unicode, fórmulas, macros limitadas, aislamiento del complemento local y rechazo de motores retirados. Ninguna de estas pruebas declara que estén implementadas todas las funciones de un formato o de otra aplicación.
