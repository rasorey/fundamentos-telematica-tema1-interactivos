/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */

const SLIDE_COUNT = 50;
const SLIDE_ASSET_VERSION = "2026-05-22-step04";

const SLIDE_TITLES = [
  "Portada",
  "Vivimos rodeados de señales",
  "Qué explica este tema",
  "Transmitir información exige convertir ideas en señales",
  "Qué podrás explicar al terminar el tema",
  "El tema avanza desde la señal hasta la decisión",
  "Una comunicación se decide al final del canal",
  "Frecuencia: ciclos por segundo",
  "Tiempo y frecuencia: dos formas de mirar una señal",
  "Fourier: construir señales sumando senos",
  "El ancho de banda decide qué componentes pasan",
  "Laboratorio interactivo · Fourier, frecuencia y ancho de banda",
  "Nyquist: el límite ideal sin ruido",
  "Shannon: el ruido pone un límite físico",
  "Laboratorio interactivo · Capacidad de canal",
  "S/N, niveles y BER conectan fórmulas con errores",
  "Analógica continua y digital decidible",
  "El receptor convierte amplitudes en decisiones",
  "Una señal degradada puede seguir siendo recuperable",
  "Un regenerador decide y reconstruye",
  "Laboratorio interactivo · Regeneración digital",
  "Banda base y pasobanda responden a canales distintos",
  "Codificar y modular no son la misma decisión",
  "La codificación de línea resuelve reloj, niveles y componente continua",
  "NRZ-L y NRZI: niveles frente a cambios",
  "AMI y pseudoternario usan tres niveles",
  "Manchester asegura una transición por bit",
  "Las rachas sin transiciones rompen el sincronismo",
  "B8ZS y HDB3 sustituyen ceros largos",
  "Cada código de línea resuelve un compromiso",
  "Laboratorio interactivo · Codificación de línea",
  "Modular es controlar una portadora",
  "Moduladora, portadora y señal modulada",
  "ASK, FSK y PSK varían parámetros de la portadora",
  "QPSK usa cuatro fases: 2 bits por símbolo",
  "Técnicas por pulsos y digitalización",
  "Muestreo: otro Nyquist, otro problema",
  "Sample & hold mantiene cada muestra",
  "PCM/MIC: muestreo → cuantificación → bits",
  "La cuantificación crea un error propio",
  "Laboratorio interactivo · PCM/MIC",
  "La modulación delta sigue la señal con una escalera",
  "Ruido, atenuación, distorsión e interferencias",
  "El error aparece al cruzar una frontera de decisión",
  "Laboratorio interactivo · Decisión y BER",
  "ENCUESTA DE AULA",
  "Lo esencial del tema cabe en nueve decisiones",
  "Autoevaluación",
  "Laboratorios del Tema 3",
  "Licencia y créditos"
];

const LAB_RECT = { x: 0.049, y: 0.215, w: 0.547, h: 0.548 };

const INTERACTIONS = [
  {
    type: "simulator",
    slide: 12,
    title: "Frecuencia, Fourier y ancho de banda",
    embedUrl: "../interactive_examples_tema3/fourier_frequency_explorer/?embed=1",
    openUrl: "../interactive_examples_tema3/fourier_frequency_explorer/",
    ...LAB_RECT
  },
  {
    type: "simulator",
    slide: 15,
    title: "Capacidad de canal",
    embedUrl: "../interactive_examples_tema3/channel_capacity_playground/?embed=1",
    openUrl: "../interactive_examples_tema3/channel_capacity_playground/",
    ...LAB_RECT
  },
  {
    type: "simulator",
    slide: 21,
    title: "Regeneración digital",
    embedUrl: "../interactive_examples_tema3/digital_regeneration_lab/?embed=1",
    openUrl: "../interactive_examples_tema3/digital_regeneration_lab/",
    ...LAB_RECT
  },
  {
    type: "simulator",
    slide: 31,
    title: "Codificación de línea",
    embedUrl: "../interactive_examples_tema3/line_coding_studio/?embed=1",
    openUrl: "../interactive_examples_tema3/line_coding_studio/",
    ...LAB_RECT
  },
  {
    type: "simulator",
    slide: 41,
    title: "PCM/MIC",
    embedUrl: "../interactive_examples_tema3/sampling_pcm_lab/?embed=1",
    openUrl: "../interactive_examples_tema3/sampling_pcm_lab/",
    ...LAB_RECT
  },
  {
    type: "simulator",
    slide: 45,
    title: "Decisión y BER",
    embedUrl: "../interactive_examples_tema3/symbol_decision_noise_lab/?embed=1",
    openUrl: "../interactive_examples_tema3/symbol_decision_noise_lab/",
    ...LAB_RECT
  }
];
