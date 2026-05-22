# Laboratorios interactivos del Tema 3

Codigo fuente HTML/CSS/JavaScript: 0BSD.  
Contenido docente propio: CC0 1.0 Universal.

Esta carpeta contiene los laboratorios implementados del Tema 3 de Fundamentos de Telematica:

- `fourier_frequency_explorer`: frecuencia, armonicos, Fourier, espectro y ancho de banda.
- `channel_capacity_playground`: Nyquist, Shannon, niveles, SNR y tasa objetivo.
- `line_coding_studio`: NRZ-L, NRZI, AMI, pseudoternario, Manchester, B8ZS y HDB3.
- `digital_regeneration_lab`: senal degradada, umbral, decision, regenerador y BER.
- `sampling_pcm_lab`: muestreo, sample & hold, cuantificacion, palabras binarias y aliasing.
- `symbol_decision_noise_lab`: perturbaciones, regiones de decision y BER.

Los laboratorios funcionan como paginas estaticas sin dependencias externas. Cada uno soporta modo normal y modo incrustado:

```text
sampling_pcm_lab/
sampling_pcm_lab/?embed=1
```

## Capturas para PowerPoint

Las capturas 16:9 se guardan en:

```text
assets/screenshots/
```

Comando documentado para regenerarlas desde la raiz del repositorio:

```bash
python -m http.server 8000 --directory docs
```

Y, en otra terminal, abrir las rutas `?embed=1` con Playwright o el navegador de validacion a 1280x720.

## Laboratorios planificados

No se crean enlaces a laboratorios no implementados. Quedan planificados:

- `baseband_passband_explorer`
- `digital_modulation_symbols`
- `delta_modulation_lab`
