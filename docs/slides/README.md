# Presentación interactiva online

Esta carpeta contiene una versión web paralela del Tema 1 de Fundamentos de Telemática. La versión oficial sigue siendo el PowerPoint distribuido por el aula virtual; este sitio web no sustituye a esa presentación.

La presentación web usa fondos renderizados desde la versión local integrada con encuestas del VPS y añade capas interactivas encima solo en las diapositivas que lo necesitan. Así mantiene la estética, diagramas, capturas, imágenes y composición del PPTX, pero permite incrustar simuladores y encuestas de aula del VPS en navegador.

## Estructura

- `index.html`: visor 16:9 de la presentación.
- `slides.css`: estilos del visor, controles, overlays, modo debug e iframes.
- `slides.js`: navegación, pantalla completa, índice, precarga de fondos y carga diferida de iframes.
- `polls-config.js`: configuración pública de encuestas del VPS.
- `interactions-config.js`: configuración de overlays de simuladores y coordenadas.
- `assets/slide-backgrounds/`: fondos renderizados de todas las diapositivas.
- `assets/thumbnails/`: miniaturas para el índice.
- `assets/qrs/`: QR de formularios, si se añaden.

## Diferencia con el PowerPoint

El PowerPoint es el material oficial para el aula virtual. La versión web es un complemento para sesiones en navegador:

- reproduce cada diapositiva como fondo 16:9;
- incrusta simuladores JavaScript con `iframe`;
- incrusta resultados de encuestas de aula servidas desde el VPS;
- ofrece fallback limpio cuando una actividad no tiene URL configurada;
- no contiene archivos `.ppt`, `.pptx` ni PDF de las diapositivas.

## Regenerar fondos desde el PPTX

Cuando cambie el PowerPoint, vuelve a renderizar todas las diapositivas a PNG 16:9 y sustituye:

```text
docs/slides/assets/slide-backgrounds/slide-01.png
docs/slides/assets/slide-backgrounds/slide-02.png
...
```

Resolución recomendada:

- mínimo: `1920x1080`;
- ideal si el peso sigue siendo razonable: `2560x1440`.

Las miniaturas del índice se guardan en:

```text
docs/slides/assets/thumbnails/
```

Los nombres deben mantener el patrón `slide-01.png`, `slide-02.png`, etc. El número total de diapositivas se configura en `interactions-config.js` mediante `SLIDE_COUNT`.

## Configurar encuestas del VPS

Edita `polls-config.js`. Cada entrada tiene esta forma:

```js
servicioDigital: {
  slide: 5,
  title: "Servicio digital crítico",
  question: "¿Qué servicio digital te resultaría más difícil perder durante 24 horas?",
  activity: "servicio-digital-critico",
  studentUrl: "https://vps-d05caed1.vps.ovh.net/polls/student/tema1-2026/servicio-digital-critico",
  displayUrl: "https://vps-d05caed1.vps.ovh.net/polls/display/tema1-2026/servicio-digital-critico?embed=1",
  displayOpenUrl: "https://vps-d05caed1.vps.ovh.net/polls/display/tema1-2026/servicio-digital-critico"
}
```

Campos:

- `slide`: número visible de diapositiva donde se coloca el overlay.
- `studentUrl`: URL pública para que el alumnado responda.
- `displayUrl`: URL compacta `?embed=1` para incrustar resultados agregados en la diapositiva web.
- `displayOpenUrl`: URL normal para abrir los resultados en una pestaña nueva.

La URL de profesor no se incluye en GitHub Pages y no debe contener token. El token privado se gestiona fuera del repositorio.

No añadas afirmaciones sobre anonimato. El texto correcto es: “No se solicita nombre ni correo.”

## Configurar simuladores

Los simuladores se configuran en `interactions-config.js`. Ejemplo:

```js
{
  slide: 58,
  type: "simulator",
  title: "Conmutación de paquetes",
  embedUrl: "../interactive_examples/packet_switching_delay/?embed=1",
  openUrl: "../interactive_examples/packet_switching_delay/",
  x: 0.075,
  y: 0.145,
  w: 0.535,
  h: 0.475
}
```

Las coordenadas son proporcionales a la diapositiva:

- `x`: distancia desde la izquierda;
- `y`: distancia desde arriba;
- `w`: ancho;
- `h`: alto.

Usa siempre la URL `?embed=1` dentro del `iframe` y la URL normal en el botón “Abrir en navegador”.

## Ajustar coordenadas

Abre la presentación con:

```text
http://localhost:8000/slides/?debug=1
```

El modo debug muestra:

- número de diapositiva;
- overlays activos;
- coordenadas;
- encuestas sin `displayUrl`;
- contorno de los overlays.

El modo normal no muestra datos técnicos.

## Probar localmente

Desde la raíz del repositorio:

```bash
cd docs
python -m http.server 8000
```

Abre:

```text
http://localhost:8000/slides/
```

Controles:

- flecha derecha / espacio: siguiente diapositiva;
- flecha izquierda: diapositiva anterior;
- `O`: índice;
- `F`: pantalla completa;
- Inicio / Fin: primera o última diapositiva.

## Publicación

GitHub Pages publica el contenido de `docs/`. La presentación queda disponible en:

```text
https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/slides/
```

## Licencia

- Código HTML/CSS/JavaScript: 0BSD.
- Contenido docente propio: CC0 1.0 Universal.
- Recursos externos: mantienen su licencia original y deben documentarse en los créditos correspondientes.
