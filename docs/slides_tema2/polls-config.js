/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */

const POLLS_BASE_URL = "https://vps-d05caed1.vps.ovh.net/polls";
const POLLS_SESSION = "tema2-2026";
const POLLS_PUBLISHED = false;

function inactivePoll(activity) {
  return {
    activity,
    studentUrl: null,
    displayUrl: null,
    displayOpenUrl: null
  };
}

function pollUrls(activity) {
  if (!POLLS_PUBLISHED) return inactivePoll(activity);
  return {
    activity,
    studentUrl: `${POLLS_BASE_URL}/student/${POLLS_SESSION}/${activity}`,
    displayUrl: `${POLLS_BASE_URL}/display/${POLLS_SESSION}/${activity}?embed=1`,
    displayOpenUrl: `${POLLS_BASE_URL}/display/${POLLS_SESSION}/${activity}`
  };
}

const POLLS = {
  protocoloPalabra: {
    slide: 5,
    title: "Protocolo en una palabra",
    question: "¿Qué palabra asocias con “protocolo”?",
    ...pollUrls("protocolo-palabra")
  },
  servicioInterfazProtocolo: {
    slide: 10,
    title: "Servicio, interfaz y protocolo",
    question: "Una API que permite a una aplicación enviar datos a la capa inferior es principalmente…",
    ...pollUrls("servicio-interfaz-protocolo")
  },
  entidadesPares: {
    slide: 14,
    title: "Entidades pares",
    question: "Dos entidades de la misma capa en máquinas distintas se comunican mediante…",
    ...pollUrls("entidades-pares")
  },
  encapsulacion: {
    slide: 19,
    title: "Encapsulación",
    question: "¿Qué añade normalmente una capa al recibir datos de la capa superior?",
    ...pollUrls("encapsulacion")
  },
  osiOrden: {
    slide: 26,
    title: "Orden de capas OSI",
    question: "Ordena de abajo arriba las capas OSI.",
    ...pollUrls("osi-orden")
  },
  saltoExtremo: {
    slide: 28,
    title: "Salto a salto o extremo a extremo",
    question: "El control de errores de enlace se aplica principalmente…",
    ...pollUrls("salto-extremo")
  },
  tcpipIp: {
    slide: 33,
    title: "IP en TCP/IP",
    question: "En la arquitectura TCP/IP, IP pertenece principalmente a la capa…",
    ...pollUrls("tcpip-ip")
  },
  cidr: {
    slide: 38,
    title: "Direccionamiento IPv4 actual",
    question: "¿Qué mecanismo describe mejor el direccionamiento IPv4 actual?",
    ...pollUrls("cidr")
  },
  puertos: {
    slide: 43,
    title: "Puertos TCP/UDP",
    question: "¿Qué identifica el puerto TCP o UDP?",
    ...pollUrls("puertos")
  },
  ideaFinal: {
    slide: 49,
    title: "Idea clave final",
    question: "Escribe una idea clave que te llevas sobre arquitecturas de protocolos.",
    ...pollUrls("idea-final")
  }
};

const POLL_OVERLAY = {
  x: 0.30,
  y: 0.17,
  w: 0.61,
  h: 0.61
};
