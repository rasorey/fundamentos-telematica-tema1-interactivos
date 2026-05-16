/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */

const SLIDE_COUNT = 54;
const SLIDE_ASSET_VERSION = "2026-05-15-t12b";

const SLIDE_TITLES = [
  "Portada",
  "Apertura",
  "Objetivos",
  "Mapa del tema",
  "Encuesta · Protocolo en una palabra",
  "Arquitectura",
  "Capas",
  "Vocabulario",
  "Servicio, interfaz y protocolo",
  "Encuesta · Servicio, interfaz y protocolo",
  "Entidades pares",
  "Jerarquía de protocolos",
  "Laboratorio · Capas y protocolos",
  "Encuesta · Entidades pares",
  "Encapsulación",
  "SDU, PDU y payload",
  "PDU por capas",
  "Desencapsulación",
  "Encuesta · Encapsulación",
  "Laboratorio · Constructor PDU",
  "Modelo OSI",
  "OSI por funciones",
  "Transporte",
  "Capas altas",
  "Unidades OSI",
  "Encuesta · Orden OSI",
  "Extremo a extremo y salto a salto",
  "Encuesta · Salto a salto",
  "Normalización",
  "Organismos de normalización",
  "Arquitectura TCP/IP",
  "Comparación OSI/TCP-IP",
  "Encuesta · IP en TCP/IP",
  "Laboratorio · OSI frente a TCP/IP",
  "Direccionamiento IP",
  "Clases históricas IPv4",
  "CIDR",
  "Encuesta · CIDR",
  "IPv6",
  "Laboratorio · Calculadora CIDR",
  "Puertos",
  "Sockets",
  "Encuesta · Puertos TCP/UDP",
  "Laboratorio · Puertos y multiplexación",
  "Ejemplo HTTPS",
  "Traza HTTPS · Aplicación",
  "Traza HTTPS · Transporte y seguridad",
  "Traza HTTPS · IP y enlace",
  "Encuesta · Idea clave final",
  "Laboratorio · Petición HTTPS",
  "Laboratorios del tema",
  "Síntesis",
  "Autoevaluación",
  "Licencia y créditos"
];

const INTERACTIONS = [
  {
    slide: 13,
    type: "simulator",
    title: "Capas y protocolos",
    embedUrl: "../interactive_examples_tema2/encapsulation_explorer/?embed=1",
    openUrl: "../interactive_examples_tema2/encapsulation_explorer/",
    x: 0.075,
    y: 0.145,
    w: 0.535,
    h: 0.475
  },
  {
    slide: 20,
    type: "simulator",
    title: "Constructor PDU",
    embedUrl: "../interactive_examples_tema2/pdu_builder/?embed=1",
    openUrl: "../interactive_examples_tema2/pdu_builder/",
    x: 0.075,
    y: 0.145,
    w: 0.535,
    h: 0.475
  },
  {
    slide: 34,
    type: "simulator",
    title: "OSI frente a TCP/IP",
    embedUrl: "../interactive_examples_tema2/osi_tcpip_mapper/?embed=1",
    openUrl: "../interactive_examples_tema2/osi_tcpip_mapper/",
    x: 0.075,
    y: 0.145,
    w: 0.535,
    h: 0.475
  },
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
  },
  {
    slide: 44,
    type: "simulator",
    title: "Puertos y multiplexación",
    embedUrl: "../interactive_examples_tema2/ports_multiplexing/?embed=1",
    openUrl: "../interactive_examples_tema2/ports_multiplexing/",
    x: 0.075,
    y: 0.145,
    w: 0.535,
    h: 0.475
  },
  {
    slide: 50,
    type: "simulator",
    title: "Petición HTTPS",
    embedUrl: "../interactive_examples_tema2/web_request_stack/?embed=1",
    openUrl: "../interactive_examples_tema2/web_request_stack/",
    x: 0.075,
    y: 0.145,
    w: 0.535,
    h: 0.475
  }
];
