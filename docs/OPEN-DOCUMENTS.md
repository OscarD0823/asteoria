# Abrir documentos directamente en ASTEORIA BETA

Windows: los instaladores registran los tipos documentales y reciben el archivo desde el Explorador. **Abrir con** permite elegir su editor independiente o ASTEORIA. Un archivo cuyo editor predeterminado ya sea ASTEORIA abre su documento al doble clic. Se respeta la elección que Windows tenga guardada para otras aplicaciones; el instalador no manipula `UserChoice`. La segunda apertura usa la misma instancia y guarda el proyecto activo antes de importar.

Web instalada: el manifiesto incluye `file_handlers` y el consumidor de `launchQueue`, con detección de soporte. Chrome y Edge en escritorio pueden registrar la PWA como editor de archivos. El navegador puede pedir permiso la primera vez. Los navegadores que no soportan esa API conservan el selector de documentos dentro de la aplicación.

Android: cada APK registra acciones Ver/Editar/Compartir para sus formatos. El archivo recibido por un proveedor de documentos se lee con el permiso de esa apertura; no se solicita acceso general al almacenamiento. También funciona si la app ya está abierta. La recepción directa está limitada a 100 MB. La disponibilidad de la aplicación en «Abrir con» depende del tipo MIME que entregue el explorador, especialmente para extensiones propias.

La suite general identifica PDF, DOCX/DOCM/TXT, XLSX/XLSM/CSV/TSV, PPTX/PPTM, SQLite, .prismapub, .atlas y .lore. Los .prisma con contenido de escritura se dirigen a Scribe. El archivo se procesa en el dispositivo y los cambios continúan guardándose en la biblioteca local de cada aplicación.
