# Fundamentos de Telemática · Tema 1 · Ejemplos interactivos

Este repositorio contiene únicamente los ejemplos interactivos web del Tema 1 de Fundamentos de Telemática. Las diapositivas del tema se distribuyen por separado a través del aula virtual.

## Sitio publicado

https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/

## Presentación interactiva online

La versión oficial del tema sigue siendo el PowerPoint distribuido desde el aula virtual. Además, este repositorio incluye una versión web paralela e interactiva, pensada para proyectarse desde navegador:

https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/slides/

Esta presentación web usa las diapositivas renderizadas del PowerPoint como fondo, de modo que mantiene el diseño visual del material oficial y añade encima capas interactivas solo donde hacen falta. Incluye:

- diapositivas 16:9 navegables con teclado, índice y pantalla completa;
- fondos de diapositiva exportados desde `TEMA_1_mejorado_v6_4.pptx`;
- simuladores JavaScript incrustados con `?embed=1`;
- encuestas de aula propias servidas desde el VPS e incrustadas como resultados en directo;
- modo diagnóstico con `?debug=1` para ajustar overlays y revisar configuración.

Las URLs de encuestas se configuran en `docs/slides/polls-config.js`. La vista proyectada incrusta los resultados agregados del VPS y el alumnado responde desde los QR o enlaces públicos de estudiante.

## Modos de uso

Cada simulador tiene dos modos:

- Modo normal: página completa para GitHub Pages, aula virtual y trabajo individual.
- Modo incrustado: añade `?embed=1` a la URL para ocultar cabecera, pie y contenido secundario y optimizar la vista 16:9.

Ejemplo:

https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/packet_switching_delay/?embed=1

También hay páginas wrapper en `docs/embed/`, útiles para complementos de PowerPoint que acepten una URL web.

Wrappers publicados:

| Ejemplo | URL embed |
|---|---|
| `full_mesh_calculator` | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/embed/full_mesh_calculator.html |
| `transmission_vs_propagation` | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/embed/transmission_vs_propagation.html |
| `circuit_switching` | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/embed/circuit_switching.html |
| `message_switching` | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/embed/message_switching.html |
| `packet_switching_delay` | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/embed/packet_switching_delay.html |
| `datagram_vs_virtual_circuit` | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/embed/datagram_vs_virtual_circuit.html |

## Ejemplos

| Ejemplo | Concepto principal | URL |
|---|---|---|
| `full_mesh_calculator` | Escalabilidad de mallas completas | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/full_mesh_calculator/ |
| `transmission_vs_propagation` | Tiempo de transmisión y tiempo de propagación | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/transmission_vs_propagation/ |
| `circuit_switching` | Conmutación de circuitos | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/circuit_switching/ |
| `message_switching` | Conmutación de mensajes y almacenamiento/reenvío | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/message_switching/ |
| `packet_switching_delay` | Conmutación de paquetes, pipeline, overhead y retardo | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/packet_switching_delay/ |
| `datagram_vs_virtual_circuit` | Datagrama frente a circuito virtual | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/datagram_vs_virtual_circuit/ |

## Uso local

```bash
cd docs
python -m http.server 8000
```

Después abre:

http://localhost:8000/

## Uso desde PowerPoint o aula virtual

Las diapositivas completas se distribuyen por el aula virtual. Desde las diapositivas se recomienda ofrecer siempre dos vías:

- QR o botón con la URL pública normal para abrir el simulador en navegador.
- URL con `?embed=1` o wrapper `docs/embed/*.html` cuando el aula o el complemento de PowerPoint permitan incrustar una página web.

Si el complemento web de PowerPoint no funciona, el simulador sigue disponible mediante QR y enlace público.

No se recomienda depender exclusivamente de la incrustación web dentro de PowerPoint. El flujo robusto para clase es:

1. Mantener en la diapositiva una captura del simulador.
2. Incluir botón y QR con la URL pública normal.
3. Usar `?embed=1` o `docs/embed/*.html` solo como mejora cuando el aula y el complemento lo permitan.

La participación en clase se gestiona con el sistema propio `telematica-polls`, desplegado fuera de GitHub Pages en el VPS. Este repositorio solo contiene la configuración pública de enlaces e iframes; no contiene tokens de profesor ni base de datos de respuestas.

La versión web `docs/slides/` incrusta las vistas de resultados `display` del VPS. Los QR públicos de estudiante pueden versionarse porque no contienen credenciales.

## Modo reto

Cada simulador incluye un modo libre con controles y un bloque “Reto” para trabajar en formato:

1. Predice o calcula.
2. Comprueba.
3. Lee una pista o solución razonada.

Este modo está pensado para actividades breves en clase y para práctica individual desde el aula virtual.

En `transmission_vs_propagation`, el reto se apoya en una línea temporal de cuatro eventos y en la comprobación “sube R 10×” para distinguir qué cambia en `Ttx` y qué no cambia en `Tprop`.

## Publicación en GitHub Pages

Este repositorio incluye el workflow `.github/workflows/pages.yml`, que publica el contenido de `docs/` como sitio estático.

Si necesitas crearlo manualmente:

```bash
gh auth login
cd fundamentos-telematica-tema1-interactivos
git init
git add .
git commit -m "Initial public interactive examples for Tema 1"
gh repo create fundamentos-telematica-tema1-interactivos --public --source=. --remote=origin --push
```

Después activa GitHub Pages desde:

Settings → Pages → Build and deployment → GitHub Actions

## Licencia

Este repositorio usa doble licencia:

- Código fuente HTML/CSS/JavaScript: 0BSD.
- Contenido docente original incluido en las páginas, diagramas propios, capturas propias y documentación docente: CC0 1.0 Universal.

Las diapositivas del tema se distribuyen aparte en el aula virtual y no forman parte del repositorio.

Las imágenes o recursos externos mantienen su licencia original y se documentan en `docs/assets/credits/IMAGE_CREDITS.md`.

## Cómo citar

Consulta `CITATION.cff`. Aunque la atribución no sea obligatoria para el material CC0, se agradece citar la fuente en contextos docentes.

## Fuentes y créditos

Las fuentes técnicas, docentes, de licencias y de datos de impacto se recogen en `sources.md`.

El sitio no incorpora fotografías ni imágenes externas. Las capturas de `docs/assets/screenshots/` son capturas propias de los simuladores y se publican como contenido docente propio bajo CC0 1.0 Universal.

## Aviso

Las diapositivas completas del tema se distribuyen a través del aula virtual. Este sitio contiene solo los ejemplos interactivos.
