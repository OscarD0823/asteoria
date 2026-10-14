# Prisma

[Abrir Prisma](https://oscard0823.github.io/prisma/) · [Página de proyectos](https://oscard0823.github.io/Pagina-Principal/)

Suite gratuita de documentos, hojas, presentaciones, PDF, datos y publicaciones. Los archivos se procesan en tu dispositivo. Autor: [OscarD0823](https://github.com/OscarD0823).

Este repositorio contiene el entorno común y el panel general. Cada editor tiene su código y página:

| Programa | Código | Página |
| --- | --- | --- |
| Prisma PDF | [prisma-pdf](https://github.com/OscarD0823/prisma-pdf) | [PDF](https://oscard0823.github.io/prisma-pdf/) |
| Prisma Writer | [prisma-writer](https://github.com/OscarD0823/prisma-writer) | [Writer](https://oscard0823.github.io/prisma-writer/) |
| Prisma Sheets | [prisma-sheets](https://github.com/OscarD0823/prisma-sheets) | [Sheets](https://oscard0823.github.io/prisma-sheets/) |
| Prisma Slides | [prisma-slides](https://github.com/OscarD0823/prisma-slides) | [Slides](https://oscard0823.github.io/prisma-slides/) |
| Prisma Data | [prisma-data](https://github.com/OscarD0823/prisma-data) | [Data](https://oscard0823.github.io/prisma-data/) |
| Prisma Publisher | [prisma-publisher](https://github.com/OscarD0823/prisma-publisher) | [Publisher](https://oscard0823.github.io/prisma-publisher/) |

La suite y los programas sueltos usan los mismos módulos. Una función se programa una vez. [Preparar el entorno y publicar](README-workspace.md).


```powershell
node scripts/workspace.mjs sync
pnpm install --frozen-lockfile
pnpm dev
```

Abre `prisma.code-workspace` para trabajar con todos los repositorios. Las páginas comprueban actualizaciones de sus módulos compartidos cada 15 minutos, sujetas a la cola de GitHub Actions.

[Windows y Android](https://github.com/OscarD0823/prisma-pdf/releases/tag/prisma-v1.2.0) · [Estado y pendientes](docs/ESTADO-Y-PENDIENTES.md) · [Compatibilidad](README-office-analysis.md) · [Macros](README-programming.md).

La compatibilidad de formatos es parcial; no se ejecuta todo VBA. No se publican documentos privados ni claves. Licencia AGPL-3.0-or-later y avisos propios de los recursos de terceros.
