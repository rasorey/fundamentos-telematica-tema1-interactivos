# Informe de implementación de laboratorios interactivos · Tema 2

## Entregables creados

Se ha creado `docs/interactive_examples_tema2/` con índice propio y seis laboratorios HTML/CSS/JavaScript vanilla:

| Laboratorio | Ruta | Conceptos principales |
|---|---|---|
| `encapsulation_explorer` | `docs/interactive_examples_tema2/encapsulation_explorer/` | capas, entidades pares, flujo real, comunicación lógica |
| `osi_tcpip_mapper` | `docs/interactive_examples_tema2/osi_tcpip_mapper/` | OSI como referencia, TCP/IP real, matices de TLS/QUIC/DNS |
| `pdu_builder` | `docs/interactive_examples_tema2/pdu_builder/` | SDU, PDU, cabeceras, payload, trailer, overhead, eficiencia |
| `cidr_calculator` | `docs/interactive_examples_tema2/cidr_calculator/` | clases históricas, CIDR, prefijo `/n`, máscara, rango IPv4 |
| `ports_multiplexing` | `docs/interactive_examples_tema2/ports_multiplexing/` | puertos TCP/UDP, multiplexación, demultiplexación, socket |
| `web_request_stack` | `docs/interactive_examples_tema2/web_request_stack/` | DNS, transporte, TLS, HTTP, IP, enlace y físico en HTTPS |

Cada laboratorio incluye `index.html`, `style.css` y `script.js`. También se ha añadido `docs/interactive_examples_tema2/index.html` como índice de laboratorios del Tema 2.

## Requisitos comunes cubiertos

- Modo normal y modo `?embed=1`.
- Controles visibles, botón `Reiniciar`, visualización dinámica y métricas.
- Secciones “Qué observar” y “Reto”.
- Diseño responsive con tarjetas limpias, fondo claro y diagramas SVG.
- Accesibilidad básica: etiquetas, `aria-live`, `role="status"` y navegación con controles nativos.
- Sin backend, sin dependencias pesadas y sin frameworks.
- Código HTML/CSS/JavaScript bajo 0BSD; contenido docente propio bajo CC0 1.0 Universal.
- No se han incorporado imágenes externas.

## Documentación actualizada

- `README.md`: añadido el bloque de ejemplos del Tema 2 y el índice publicado.
- `CHANGELOG.md`: añadida entrada `1.6.0 - 2026-05-15`.
- `docs/index.html`: portada web actualizada para enlazar Tema 1 y Tema 2.

## Validación realizada

- Estructura de archivos: verificada la existencia de los seis laboratorios y sus tres archivos mínimos.
- Reglas de contenido: sin apariciones de textos prohibidos, referencias a servicios de encuestas externos ni marcadores provisionales en los nuevos laboratorios y documentación actualizada.
- Repositorio: no se detectan archivos `.ppt`, `.pptx` ni `.pdf`.
- Navegador integrado: cargados índice, seis laboratorios, modos normales y modos `?embed=1` sin errores JavaScript.
- Interacciones: probados botones principales, comprobaciones de reto y reinicio en los seis laboratorios.
- Responsive: revisado `cidr_calculator` en 1280×720 y 390×844; sin desplazamiento horizontal en móvil.

## URLs previstas en GitHub Pages

- Índice Tema 2: `https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples_tema2/`
- Modo incrustado: añadir `?embed=1` a cualquiera de los laboratorios.

## Observaciones

Los laboratorios están listos para enlazarse desde PowerPoint, aula virtual o una futura presentación web del Tema 2. No se han creado wrappers `docs/embed/` específicos para Tema 2 porque el modo `?embed=1` queda operativo directamente en cada laboratorio.
