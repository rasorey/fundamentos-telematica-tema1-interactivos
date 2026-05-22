# Informe de presentación web · Tema 3 step04

Fecha: 2026-05-22

URL pública:

https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/slides_tema3/

Modo diagnóstico:

https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/slides_tema3/?debug=1

## Estructura creada

- `docs/slides_tema3/index.html`
- `docs/slides_tema3/slides.css`
- `docs/slides_tema3/slides.js`
- `docs/slides_tema3/interactions-config.js`
- `docs/slides_tema3/polls-config.js`
- `docs/slides_tema3/assets/slide-backgrounds/slide-01.png` a `slide-50.png`
- `docs/slides_tema3/README.md`

## Validación local

Servidor local usado:

```bash
python3 -m http.server 8023 --directory docs
```

Resultado:

- `slides_tema3/?debug=1` abre sin errores de consola.
- Los fondos de diapositiva cargan correctamente.
- Las diapositivas 12, 15, 21, 31, 41 y 45 crean un iframe de laboratorio.
- Los seis iframes cargan en modo `?embed=1` con estado `loaded=true`.

## Validación pública

Después de publicar el commit `707747d`, GitHub Pages devolvió 200 para:

- los seis laboratorios en URL normal;
- los seis laboratorios en URL `?embed=1`;
- `slides_tema3/`.

Validación en navegador headless sobre la URL pública:

- diapositiva 12: iframe `fourier_frequency_explorer/?embed=1` cargado;
- diapositiva 15: iframe `channel_capacity_playground/?embed=1` cargado;
- diapositiva 21: iframe `digital_regeneration_lab/?embed=1` cargado;
- diapositiva 31: iframe `line_coding_studio/?embed=1` cargado;
- diapositiva 41: iframe `sampling_pcm_lab/?embed=1` cargado;
- diapositiva 45: iframe `symbol_decision_noise_lab/?embed=1` cargado;
- errores JavaScript de consola: 0.

## Encuestas

No se han incrustado vistas de encuesta porque no hay URLs reales del VPS validadas para la sesión de Tema 3. La diapositiva de actividad mantiene fallback limpio desde el PowerPoint.

## Limitaciones

- La versión web no sustituye al PowerPoint del aula virtual.
- Los iframes dependen de GitHub Pages. Si se usa sin conexión, debe servirse una copia local de `docs/`.
