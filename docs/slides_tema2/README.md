# Presentación interactiva online · Tema 2

Esta carpeta contiene la versión web del Tema 2 de Fundamentos de Telemática. La presentación oficial sigue siendo el PowerPoint distribuido por el aula virtual; esta web es un complemento para navegar en navegador, incrustar laboratorios y mostrar encuestas de aula cuando el VPS tenga la sesión publicada.

## Estructura

- `index.html`: visor 16:9 de la presentación.
- `slides.css`: estilos del visor, controles, overlays, modo debug e iframes.
- `slides.js`: navegación, pantalla completa, índice, precarga de fondos y carga diferida de iframes.
- `interactions-config.js`: títulos, número de diapositivas, laboratorios y coordenadas.
- `polls-config.js`: configuración pública de encuestas del VPS.
- `assets/slide-backgrounds/`: fondos renderizados de todas las diapositivas.
- `assets/thumbnails/`: miniaturas para el índice.

## Regenerar fondos

Cuando cambie el PowerPoint, exporta `TEMA_2_mejorado_v1_step11_animaciones.pptx` a PDF y renderiza cada página como PNG 16:9. Resolución recomendada: `1920x1080`.

Ejemplo desde la carpeta superior del proyecto:

```bash
soffice --headless --convert-to pdf --outdir outputs/tarea12_tema2_web TEMA_2_mejorado_v1_step11_animaciones.pptx
pdftoppm -png -r 144 outputs/tarea12_tema2_web/TEMA_2_mejorado_v1_step11_animaciones.pdf outputs/tarea12_tema2_web/render_tmp/slide
```

Después renombra o procesa los PNG para mantener este patrón:

```text
docs/slides_tema2/assets/slide-backgrounds/slide-01.png
docs/slides_tema2/assets/slide-backgrounds/slide-02.png
...
```

Las miniaturas del índice se guardan como:

```text
docs/slides_tema2/assets/thumbnails/slide-01.jpg
docs/slides_tema2/assets/thumbnails/slide-02.jpg
...
```

Si cambia el número de diapositivas, actualiza `SLIDE_COUNT` y `SLIDE_TITLES` en `interactions-config.js`.

## Ajustar overlays

Los overlays usan coordenadas proporcionales:

- `x`: distancia desde la izquierda.
- `y`: distancia desde arriba.
- `w`: ancho.
- `h`: alto.

Abre el visor con modo debug para ver contornos y coordenadas:

```text
http://localhost:8000/slides_tema2/?debug=1
```

El modo normal no muestra datos técnicos.

## Actualizar laboratorios

Los laboratorios se configuran en `interactions-config.js`. Cada entrada debe usar:

```js
{
  slide: 40,
  type: "simulator",
  title: "Calculadora CIDR",
  embedUrl: "../interactive_examples_tema2/cidr_calculator/?embed=1",
  openUrl: "../interactive_examples_tema2/cidr_calculator/",
  x: 0.075,
  y: 0.145,
  w: 0.535,
  h: 0.475
}
```

Usa siempre `?embed=1` en el `iframe` y la URL normal en el botón para abrir el laboratorio en otra pestaña.

## Actualizar encuestas

Las encuestas se configuran en `polls-config.js`. Mientras la sesión `tema2-2026` no esté publicada en el VPS, `POLLS_PUBLISHED` debe estar en `false` y el visor mostrará un fallback limpio.

Cuando el VPS tenga URLs reales:

1. Cambia `POLLS_PUBLISHED` a `true`.
2. Comprueba las URLs de estudiante y display.
3. Mantén cualquier acceso privado de profesor fuera del repositorio.

El visor usa estas rutas públicas cuando la sesión está publicada:

```text
https://vps-d05caed1.vps.ovh.net/polls/student/tema2-2026/<slug>
https://vps-d05caed1.vps.ovh.net/polls/display/tema2-2026/<slug>?embed=1
```

## Probar localmente

Desde la raíz del repositorio:

```bash
cd docs
python -m http.server 8000
```

Abre:

```text
http://localhost:8000/slides_tema2/
```

Controles:

- flecha derecha / espacio: siguiente diapositiva;
- flecha izquierda: diapositiva anterior;
- `O`: índice;
- `F`: pantalla completa;
- Inicio / Fin: primera o última diapositiva.

## Publicar en GitHub Pages

GitHub Pages publica el contenido de `docs/`. La URL prevista es:

```text
https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/slides_tema2/
```

No se debe subir el PowerPoint ni el PDF de exportación al repositorio. Solo se alojan los fondos renderizados, el visor web, laboratorios, assets, documentación y licencias.

## Licencia

- Código HTML/CSS/JavaScript: 0BSD.
- Contenido docente propio: CC0 1.0 Universal.
- Recursos externos: mantienen su licencia original y deben documentarse en los créditos correspondientes.
