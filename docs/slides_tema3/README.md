# Tema 3 · Presentación online

Esta carpeta contiene la versión web del Tema 3 de Fundamentos de Telemática.

La presentación oficial en PowerPoint se distribuye desde el aula virtual. Esta versión web es un complemento para proyectar desde navegador y para incrustar los laboratorios interactivos en las diapositivas correspondientes.

## Publicación

URL prevista:

https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/slides_tema3/

## Estructura

- `index.html`: visor 16:9 navegable.
- `slides.css`: estilos del visor.
- `slides.js`: navegación, modo índice, pantalla completa y diagnóstico.
- `interactions-config.js`: diapositivas con iframes de laboratorios.
- `polls-config.js`: configuración pública de encuestas si se activan en el VPS.
- `assets/slide-backgrounds/`: fondos PNG renderizados desde `TEMA_3_mejorado_v1_step04.pptx`.

## Laboratorios incrustados

La versión web incrusta los seis laboratorios implementados en modo `?embed=1`:

- `fourier_frequency_explorer`
- `channel_capacity_playground`
- `digital_regeneration_lab`
- `line_coding_studio`
- `sampling_pcm_lab`
- `symbol_decision_noise_lab`

## Modo diagnóstico

Abrir:

https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/slides_tema3/?debug=1

El modo diagnóstico muestra número de diapositiva, overlays activos, URL de cada iframe y estado de carga.

## Licencias

Código HTML/CSS/JavaScript: 0BSD.

Contenido docente propio y fondos renderizados de las diapositivas: CC0 1.0 Universal.

Las imágenes externas integradas en los fondos mantienen su licencia original y se documentan fuera de esta carpeta en los créditos del Tema 3.
