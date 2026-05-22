# Tema 3 · Informe de Fase A de laboratorios

Código fuente de los laboratorios: 0BSD.  
Contenido docente propio asociado: CC0 1.0 Universal.

## Resumen

Se han implementado los tres laboratorios prioritarios de la Fase A del Tema 3:

| Laboratorio | Estado | URL normal | URL embed | Captura |
| --- | --- | --- | --- | --- |
| fourier_frequency_explorer | Implementado y validado | `http://127.0.0.1:8000/interactive_examples_tema3/fourier_frequency_explorer/` | `http://127.0.0.1:8000/interactive_examples_tema3/fourier_frequency_explorer/?embed=1` | `docs/interactive_examples_tema3/assets/screenshots/fourier_frequency_explorer.png` |
| channel_capacity_playground | Implementado y validado | `http://127.0.0.1:8000/interactive_examples_tema3/channel_capacity_playground/` | `http://127.0.0.1:8000/interactive_examples_tema3/channel_capacity_playground/?embed=1` | `docs/interactive_examples_tema3/assets/screenshots/channel_capacity_playground.png` |
| line_coding_studio | Implementado y validado | `http://127.0.0.1:8000/interactive_examples_tema3/line_coding_studio/` | `http://127.0.0.1:8000/interactive_examples_tema3/line_coding_studio/?embed=1` | `docs/interactive_examples_tema3/assets/screenshots/line_coding_studio.png` |

Indice local del bloque: `http://127.0.0.1:8000/interactive_examples_tema3/`.

## Validaciones realizadas

| Comprobación | Resultado |
| --- | --- |
| Apertura del índice del Tema 3 | OK, HTTP 200 |
| Apertura normal de cada laboratorio | OK, HTTP 200 |
| Apertura de cada laboratorio con `?embed=1` | OK, HTTP 200 |
| Consola JavaScript en navegador | Sin errores en las rutas probadas |
| Controles interactivos | Actualizan gráficos, métricas y mensajes |
| Sintaxis JavaScript | `node --check` correcto en los tres scripts |
| Capturas 16:9 | PNG reales de 1280 x 720 |
| Enlaces del índice | Solo enlazan laboratorios implementados |
| Laboratorios planificados | Marcados como planificados sin enlaces rotos |
| Artefactos no permitidos | No se han generado PPTX ni PDF |
| Dependencias externas | No se han añadido dependencias externas |

Comando usado para servir localmente durante la validación:

```bash
python3 -m http.server 8000 --directory docs
```

## fourier_frequency_explorer

Objetivo docente cubierto:
frecuencia fundamental, periodo, armónicos, suma finita de senos, espectro por barras y efecto del ancho de banda del canal.

Entradas del estudiante:
tipo de señal objetivo, número de armónicos, frecuencia fundamental, ancho de banda del canal, presets y reto.

Salida visual:
tres paneles sincronizados: componentes senoidales, suma temporal con señal objetivo y espectro con ventana de ancho de banda.

Validaciones específicas:
el preset de onda cuadrada en canal estrecho muestra pérdida de armónicos, deformación de la señal reconstruida y mensaje interpretativo. La explicación evita integrales y formula Fourier como aproximación de muchas señales periódicas de interés.

Limitaciones:
el modelo es una aproximación finita y pedagógica; no pretende cubrir análisis espectral avanzado ni señales no periódicas con detalle matemático.

Siguientes mejoras:
añadir modo de reconstrucción filtrada más explícito y un selector opcional de fase para mostrar su efecto sin sobrecargar la interfaz.

## channel_capacity_playground

Objetivo docente cubierto:
comparar Nyquist y Shannon como límites de diseño, distinguir SNR en dB de S/N lineal y evaluar una tasa objetivo frente a ambos límites.

Entradas del estudiante:
ancho de banda B, niveles M, SNR en dB, tasa objetivo y presets.

Modelo usado:

```text
Rb,max = 2 · B · log2(M)
C = B · log2(1 + S/N)
S/N = 10^(SNR_dB / 10)
```

Salida visual:
barras comparativas de Nyquist, Shannon y tasa objetivo; diagrama cualitativo de separación entre niveles; conversión de SNR y estado de viabilidad.

Validaciones específicas:
la conversión dB a escala lineal se calcula antes de aplicar Shannon. Los presets muestran casos viables, limitados por Nyquist y limitados por Shannon.

Limitaciones:
el laboratorio muestra límites teóricos y no modela eficiencia de códigos, modulación real, margen de implementación ni BER de un sistema concreto.

Siguientes mejoras:
añadir un selector de unidades para B y tasa objetivo, y un modo de comparación de margen respecto al límite efectivo.

## line_coding_studio

Objetivo docente cubierto:
comparar cómo una misma secuencia de bits se transforma en señales de línea y mostrar por qué importan transiciones, sincronismo, componente continua cualitativa y sustitución de ceros largos.

Entradas del estudiante:
bits editables, secuencias obligatorias, código principal, polaridad inicial y opciones de visualización.

Códigos incluidos:
NRZ-L, NRZI, Bipolar-AMI, pseudoternario, Manchester, B8ZS y HDB3.

Secuencias obligatorias incluidas:
`10110010`, `00000000`, `100000000001`, `110000000011`.

Salida visual:
bits alineados, rejilla temporal común, niveles +V/0/-V, transiciones, marcas de violación y balance bipolar.

Validaciones específicas:
NRZ-L y NRZI se distinguen por nivel frente a transición; AMI y pseudoternario alternan polaridad en bits opuestos; Manchester muestra transición central; B8ZS/HDB3 introducen transiciones reconocibles en secuencias largas de ceros.

Limitaciones:
B8ZS y HDB3 se tratan como visualización docente de finalidad y violaciones reconocibles; no se plantea como tabla exhaustiva de todos los casos normativos.

Siguientes mejoras:
añadir comparación de densidad de transiciones, componente continua estimada por ventana y exportación de la secuencia codificada como tabla.

## Capturas para PowerPoint

Las capturas generadas están en:

- `docs/interactive_examples_tema3/assets/screenshots/fourier_frequency_explorer.png`
- `docs/interactive_examples_tema3/assets/screenshots/channel_capacity_playground.png`
- `docs/interactive_examples_tema3/assets/screenshots/line_coding_studio.png`

Todas tienen resolución 1280 x 720 y están preparadas desde el modo `?embed=1`, con cabecera compacta y botón de apertura en navegador.

## Notas de producción

La Fase A queda lista para condicionar el diseño del PPTX del Tema 3. La siguiente fase puede integrar estas capturas como apoyo visual provisional y decidir qué laboratorios se enlazan desde las diapositivas con QR reales cuando las URLs definitivas del VPS estén activas y devuelvan HTTP 200.
