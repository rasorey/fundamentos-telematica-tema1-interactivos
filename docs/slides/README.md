# Presentación interactiva online

Esta carpeta contiene una versión web paralela del Tema 1 de Fundamentos de Telemática. La versión oficial sigue siendo `TEMA_1_mejorado_v6_4.pptx`, distribuida por el aula virtual; este sitio web no sustituye al PowerPoint.

La presentación web usa fondos renderizados desde el PowerPoint oficial y añade capas interactivas encima solo en las diapositivas que lo necesitan. Así mantiene la estética, diagramas, capturas, imágenes y composición del PPTX, pero permite incrustar simuladores y Microsoft Forms en navegador.

## Estructura

- `index.html`: visor 16:9 de la presentación.
- `slides.css`: estilos del visor, controles, overlays, modo debug e iframes.
- `slides.js`: navegación, pantalla completa, índice, precarga de fondos y carga diferida de iframes.
- `forms-config.js`: configuración de Microsoft Forms.
- `interactions-config.js`: configuración de overlays de simuladores y coordenadas.
- `assets/slide-backgrounds/`: fondos renderizados de todas las diapositivas.
- `assets/thumbnails/`: miniaturas para el índice.
- `assets/qrs/`: QR de formularios, si se añaden.

## Diferencia con el PowerPoint

El PowerPoint es el material oficial para el aula virtual. La versión web es un complemento para sesiones en navegador:

- reproduce cada diapositiva como fondo 16:9;
- incrusta simuladores JavaScript con `iframe`;
- puede incrustar Microsoft Forms si se añaden URLs de inserción reales;
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

## Configurar Microsoft Forms

Edita `forms-config.js`. Cada entrada tiene esta forma:

```js
servicioDigital: {
  slide: 5,
  title: "Servicio digital crítico",
  question: "¿Qué servicio digital te resultaría más difícil perder durante 24 horas?",
  embedUrl: "https://forms.office.com/Pages/ResponsePage.aspx?...&embed=true",
  openUrl: "https://forms.office.com/...",
  qr: "./assets/qrs/servicio-digital.png"
}
```

Campos:

- `slide`: número visible de diapositiva donde se coloca el overlay.
- `embedUrl`: URL de inserción para cargar Forms dentro de un `iframe`.
- `openUrl`: URL normal para abrir Forms en una pestaña nueva.
- `qr`: ruta relativa a una imagen QR, si se quiere mostrar.

Si `embedUrl` está vacío, el modo presentación muestra una tarjeta limpia: “Actividad disponible desde el aula virtual”. El modo debug indica qué Forms siguen sin URL.

No añadas afirmaciones sobre anonimato, cuentas o acceso si no están confirmadas en la configuración real del formulario.

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
- Forms sin `embedUrl`;
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
