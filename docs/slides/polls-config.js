/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */

const POLLS_BASE_URL = "https://vps-d05caed1.vps.ovh.net/polls";
const POLLS_SESSION = "tema1-2026";

function pollUrls(activity) {
  return {
    activity,
    studentUrl: `${POLLS_BASE_URL}/student/${POLLS_SESSION}/${activity}`,
    displayUrl: `${POLLS_BASE_URL}/display/${POLLS_SESSION}/${activity}?embed=1`,
    displayOpenUrl: `${POLLS_BASE_URL}/display/${POLLS_SESSION}/${activity}`
  };
}

const POLLS = {
  servicioDigital: {
    slide: 5,
    title: "Servicio digital crítico",
    question: "¿Qué servicio digital te resultaría más difícil perder durante 24 horas?",
    ...pollUrls("servicio-digital-critico")
  },
  redesEnUnaPalabra: {
    slide: 6,
    title: "Redes en una palabra",
    question: "¿Qué palabra asocias con Internet o redes de computadores?",
    ...pollUrls("redes-en-una-palabra")
  },
  videollamada: {
    slide: 13,
    title: "Videollamada y calidad percibida",
    question: "¿Qué crees que pesa más en la experiencia de una videollamada?",
    ...pollUrls("videollamada-calidad")
  },
  mallaCompleta: {
    slide: 22,
    title: "Escalabilidad de una malla completa",
    question: "Para N = 20 nodos en malla completa, ¿cuántos enlaces hacen falta?",
    ...pollUrls("malla-completa")
  },
  circuitos: {
    slide: 29,
    title: "Conmutación de circuitos",
    question: "¿Qué caracteriza a la conmutación de circuitos?",
    ...pollUrls("conmutacion-circuitos")
  },
  paquetes: {
    slide: 37,
    title: "Mensajes frente a paquetes",
    question: "¿Qué ventaja principal introduce segmentar en paquetes?",
    ...pollUrls("mensajes-vs-paquetes")
  },
  datagramaCircuitoVirtual: {
    slide: 46,
    title: "Datagrama frente a circuito virtual",
    question: "¿Qué modo puede entregar paquetes desordenados con más facilidad?",
    ...pollUrls("datagrama-vs-circuito-virtual")
  },
  transmisionPropagacion: {
    slide: 51,
    title: "Transmisión frente a propagación",
    question: "Si duplicamos la tasa R del enlace, ¿qué componente baja directamente?",
    ...pollUrls("transmision-vs-propagacion")
  },
  serviciosLatencia: {
    slide: 53,
    title: "Servicios sensibles a latencia y jitter",
    question: "Ordena de más sensible a menos sensible a latencia y jitter.",
    ...pollUrls("servicios-latencia-jitter")
  },
  ideaFinal: {
    slide: 63,
    title: "Idea clave final",
    question: "Escribe una idea clave que te llevas de este tema.",
    ...pollUrls("idea-clave-final")
  }
};

const POLL_OVERLAY = {
  x: 0.30,
  y: 0.17,
  w: 0.61,
  h: 0.61
};
