# Asteoria Atlas 0.3.0 BETA

Editor de espacios con modelos paramétricos locales, métricas en metros y vistas 2D/3D. El nombre anterior del formato y las claves de almacenamiento se mantienen para abrir proyectos existentes; los nuevos archivos se descargan con extensión `.atlas`.

## Catálogo y edición

92 modelos locales: muebles, camas y armarios, cocina y baño, electrodomésticos, televisores y cine en casa, luminarias, árboles, piscinas, cubiertas y escaleras, vehículos terrestres, acuáticos y aéreos. Las geometrías incluyen cojines, patas, marcos, ruedas, cabinas, pantallas, tiradores y otros detalles. Son representaciones paramétricas de diseño, no escaneos fotográficos ni objetos BIM certificados.

Colocación, selección, arrastre, altura, giro, escala, duplicación y eliminación en 3D. Los cambios mantienen un historial de 80 estados con referencias compartidas. Los modelos importados se pueden volver a colocar desde el catálogo y conservan las dimensiones escogidas.

## Plantas, rendimiento y memoria

Hasta 200 plantas, 200 000 objetos en el proyecto y 10 000 objetos por planta. Repetir planta remapea espacios, muros, puertas, ventanas, muebles y luces sin duplicar los datos de un modelo importado. Las medidas y planos de referencia no se repiten.

Se carga el interior de la planta activa. La vista del edificio conserva las demás plantas como fachadas y losas simplificadas; haz clic en una fachada para activar ese piso. El selector de planta también funciona durante un recorrido. No hay tránsito físico por escaleras ni ascensor simulado.

El motor combina piezas de cada modelo, comparte geometrías y materiales, agrupa instancias por tipo y posición, usa detalle según distancia y limita los triángulos detallados por fotograma. El movimiento actualiza los buffers existentes. Las colisiones usan un índice espacial y el guardado grande usa IndexedDB. La biblioteca muestra resúmenes y abre un solo proyecto completo.

| Modo | Pixel ratio máximo | Triángulos detallados por vista | Sombras en tiempo real |
| --- | ---: | ---: | --- |
| Eco | 1 | 250 000 | Ninguna |
| Equilibrado | 1,25 | 900 000 | Sol |
| Detalle | 1,5 | 2 400 000 | Sol y una lámpara |

Los objetos que superan el presupuesto se representan con volúmenes simples. La selección conserva su detalle. Durante el recorrido se limita también la distancia de visualización. Los renders exportados permiten un presupuesto de detalle mayor y aplican oclusión ambiental únicamente al generar la imagen. Hasta ocho fuentes físicas próximas iluminan la planta a la vez; el proyecto puede almacenar 2048 fuentes por planta. Cambiar luces o el entorno actualiza las sombras; caminar y arrastrar no recalcula todos los mapas de sombra en cada fotograma.

El objetivo de 2 GB necesita medición en cada equipo. El contador de geometría y el heap JS no son la memoria total de la app ni la VRAM. La prueba Windows registra la suma de working set de los procesos Electron y la suma conservadora de sus máximos. El fichero de resultados contiene hardware, escena y FPS; no es una garantía para archivos arbitrarios, muchos modelos distintos o todas las GPU.

## Importación y conversión

| Formato | Conversión disponible | Condiciones |
| --- | --- | --- |
| SVG | Muros desde contornos o volumen extruido | Áreas cerradas, sin scripts ni recursos externos; revisar unidades |
| DXF ASCII | Muros, polilíneas cerradas extruidas | LINE, LWPOLYLINE, POLYLINE, CIRCLE, ARC, SOLID, 3DFACE; INSUNITS cuando existe |
| PDF | Primera página como referencia o extrusión de zonas oscuras | Hay que definir ancho y altura; no interpreta habitaciones ni estructura |
| PNG, JPG/JPEG, WebP, BMP, GIF, AVIF | Referencia o silueta extruida | Reescalada a una resolución acotada; animaciones no importadas |
| GLB/GLTF | Objeto 3D estático editable | Seleccionar recursos locales .bin e imágenes de GLTF; hasta 16 texturas PNG/JPEG/WebP de 2048 px |
| OBJ | Malla y color base | Materiales MTL externos omitidos; confirmar unidades |
| STL, PLY | Malla editable | Confirmar escala y altura; no contienen una unidad fiable |

32 MB por archivo y 64 MB por importación; 200 000 triángulos por modelo. Los modelos guardados pueden ocupar hasta 64 MB de datos incluidos y las referencias hasta 32 MB. Las texturas GLTF se agrupan en un atlas; no se conservan mapas normales, transmisión avanzada, animaciones, Draco, Meshopt o KTX2. DWG debe exportarse como DXF ASCII, FBX/3DS como GLB sin compresión y BIM/IFC necesita una conversión previa.

La conversión de imagen extruye zonas oscuras y conserva huecos; no reconstruye automáticamente una vivienda a partir de una fotografía. SVG/DXF/PDF exportan la planta y la **huella exterior proyectada** de los objetos 3D. La huella se simplifica a un contorno convexo y no incluye automáticamente puertas, detalles internos o plantas ocultas.

## Lote, mapa y relieve

Se puede dibujar el perímetro sobre OpenStreetMap, editar latitud/longitud WGS84, importar un polígono GeoJSON y exportar el lote. El mapa muestra los espacios del proyecto y solicita solo nueve teselas visibles; no se descarga un mapa completo ni se precarga para uso sin conexión. Requiere internet y conserva la atribución. [Política de teselas de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/).

Terreno con ancho/fondo, cota local, pendientes este/sur y paisaje de pradera, arena, urbano o nieve. Importación de ASC, XYZ/CSV/TXT (X, norte, altura en metros) y HGT SRTM. La malla se reduce a un máximo de 129 × 129 muestras. HGT recorta el área escogida y puede tener resolución original de 30 o 90 m; no aporta por sí solo detalle topográfico de un lote pequeño. ASC geográfico reconoce celdas angulares; un ASC proyectado requiere situar manualmente el origen. El botón de base ajusta las elevaciones de las plantas al terreno bajo el origen del proyecto.

GeoTIFF necesita exportación a ASC; KML necesita GeoJSON. No se consulta automáticamente un catastro ni se verifica la propiedad de un terreno. Durante el recorrido, el suelo interior usa la elevación de planta y el exterior usa alturas del terreno, con colisiones básicas.

## Validación y fuentes

Pruebas de geometría, unidades y PDF, migración de formatos, aberturas, historial compartido, réplica de plantas, 40 000 objetos, colisiones, presupuestos de LOD, importación DXF, extrusión con huecos, terrenos y guardado IndexedDB. El harness del navegador prueba PDF, SVG, DXF, raster, OBJ, STL, PLY, GLTF texturizado y GLB dentro de Electron.

API de instancias: [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html). Formato del terreno: [GDAL AAIGrid/ASC](https://gdal.org/en/stable/drivers/raster/aaigrid.html). El catálogo y su geometría son código original del proyecto. Se conserva la licencia AGPL y los avisos de dependencias. No se copiaron activos de Pascal.
