# Tema 3 · Fase C · Informe de laboratorios

Fecha: 2026-05-22

## Resumen

Se han implementado y validado tres laboratorios prioritarios nuevos para el Tema 3:

| Laboratorio | Estado | URL normal | URL embed | Captura |
|---|---|---|---|---|
| `digital_regeneration_lab` | Implementado y validado | `docs/interactive_examples_tema3/digital_regeneration_lab/` | `docs/interactive_examples_tema3/digital_regeneration_lab/?embed=1` | `docs/interactive_examples_tema3/assets/screenshots/digital_regeneration_lab.png` |
| `sampling_pcm_lab` | Implementado y validado | `docs/interactive_examples_tema3/sampling_pcm_lab/` | `docs/interactive_examples_tema3/sampling_pcm_lab/?embed=1` | `docs/interactive_examples_tema3/assets/screenshots/sampling_pcm_lab.png` |
| `symbol_decision_noise_lab` | Implementado y validado | `docs/interactive_examples_tema3/symbol_decision_noise_lab/` | `docs/interactive_examples_tema3/symbol_decision_noise_lab/?embed=1` | `docs/interactive_examples_tema3/assets/screenshots/symbol_decision_noise_lab.png` |

## Validaciones realizadas

| Comprobación | Resultado |
|---|---|
| HTML/CSS/JavaScript sin dependencias externas | Correcto |
| Licencia en HTML/CSS/JS | Correcto: codigo 0BSD y contenido docente CC0 |
| Modo normal devuelve 200 | Correcto en los tres laboratorios |
| Modo `?embed=1` devuelve 200 | Correcto en los tres laboratorios |
| Errores JavaScript en consola | No detectados |
| Vista embebida 1280x720 sin scroll vertical | Correcto |
| Capturas 16:9 | Correcto, 1280x720 |
| Controles actualizan visualizacion y metricas | Correcto |
| Indice del Tema 3 sin enlaces rotos a laboratorios planificados | Correcto |

## Validacion por laboratorio

### `digital_regeneration_lab`

- Objetivo: mostrar decision por umbral, regeneracion y BER.
- Controles validados: bits, ruido, atenuacion, umbral, separacion entre niveles, regenerador y presets.
- Resultado observado: el preset de error produce BER distinta de cero; con ruido moderado se observaron 2 errores sobre 8 bits.
- Captura: `docs/interactive_examples_tema3/assets/screenshots/digital_regeneration_lab.png`.
- Limitacion: el modelo de ruido es determinista para hacer la clase reproducible; no simula canal fisico completo.

### `sampling_pcm_lab`

- Objetivo: visualizar senal analogica, muestras, sample & hold, cuantificacion, palabras binarias y aliasing.
- Controles validados: frecuencia de senal, frecuencia de muestreo, bits por muestra, rango y capas visibles.
- Resultado observado: al bajar `fs` por debajo del criterio se activa el aviso de aliasing; al subir bits por muestra cambian niveles y error.
- Captura: `docs/interactive_examples_tema3/assets/screenshots/sampling_pcm_lab.png`.
- Limitacion: usa una senoidal simple para mantener la explicacion centrada en PCM/MIC.

### `symbol_decision_noise_lab`

- Objetivo: conectar perturbaciones, regiones de decision y BER.
- Controles validados: numero de niveles, ruido, atenuacion, distorsion, interferencia, numero de simbolos y regeneracion de muestra.
- Resultado observado: al aumentar niveles con ruido constante aumenta la probabilidad de error por menor margen.
- Captura: `docs/interactive_examples_tema3/assets/screenshots/symbol_decision_noise_lab.png`.
- Limitacion: la BER se calcula sobre una secuencia finita de simbolos para uso interactivo en clase.

## Siguientes mejoras

- Ajustar acentos visibles en algunos textos de interfaz si se decide homogeneizar toda la web del Tema 3.
- Implementar en una fase posterior los laboratorios planificados: `baseband_passband_explorer`, `digital_modulation_symbols` y `delta_modulation_lab`.
- Generar QR publicos solo cuando las URLs definitivas esten publicadas y respondan correctamente.
