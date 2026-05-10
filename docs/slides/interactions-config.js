/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */

const SLIDE_COUNT = 67;

const SLIDE_TITLES = [
  "Portada",
  "Objetivos",
  "Vivimos sobre redes",
  "Qué se juega en una red",
  "Forms · Servicio digital crítico",
  "Forms · Redes en una palabra",
  "Mapa del tema",
  "Red de computadores",
  "Telemática",
  "Modelo básico de comunicación",
  "Modelo clásico de sistema telemático",
  "Videollamada",
  "Forms · Videollamada",
  "Funciones de comunicación",
  "Tareas clásicas",
  "Vocabulario",
  "Clasificación por rango",
  "Clasificación por función y medio",
  "Malla completa",
  "Escalabilidad de la malla",
  "Laboratorio · Malla completa",
  "Forms · Malla completa",
  "Red conmutada",
  "Nodo periférico y nodo de tránsito",
  "Conmutar",
  "Conmutación de circuitos",
  "Circuitos · fases",
  "Laboratorio · Circuitos",
  "Forms · Circuitos",
  "Conmutación de mensajes",
  "Mensajes · dirección",
  "Almacenamiento y reenvío",
  "Mensajes · sin pipeline",
  "Laboratorio · Mensajes",
  "Conmutación de paquetes",
  "Pipeline",
  "Forms · Mensajes frente a paquetes",
  "Datagrama vs circuito virtual",
  "Modo datagrama",
  "Nodo datagrama",
  "Circuito virtual",
  "Traducción de IdCV",
  "Comparación visual",
  "Comparación completa",
  "Laboratorio · Datagrama vs circuito virtual",
  "Forms · Datagrama vs circuito virtual",
  "Tamaño y retardo",
  "Segmentación y pipeline",
  "Transmisión y propagación",
  "Laboratorio · Transmisión vs propagación",
  "Forms · Transmisión vs propagación",
  "Latencia y caudal",
  "Forms · Servicios sensibles",
  "Retardo extremo a extremo",
  "Throughput, goodput y overhead",
  "Colas, congestión y jitter",
  "Tamaño de paquete",
  "Laboratorio · Paquetes y retardo",
  "Cálculo sencillo",
  "Decisiones y métricas",
  "Síntesis",
  "Servicios",
  "Forms · Idea clave final",
  "Ideas clave",
  "Autoevaluación",
  "Licencia y reutilización",
  "Créditos de imágenes"
];

const INTERACTIONS = [
  {
    slide: 21,
    type: "simulator",
    title: "Malla completa",
    embedUrl: "../interactive_examples/full_mesh_calculator/?embed=1",
    openUrl: "../interactive_examples/full_mesh_calculator/",
    x: 0.075,
    y: 0.145,
    w: 0.535,
    h: 0.475
  },
  {
    slide: 28,
    type: "simulator",
    title: "Conmutación de circuitos",
    embedUrl: "../interactive_examples/circuit_switching/?embed=1",
    openUrl: "../interactive_examples/circuit_switching/",
    x: 0.075,
    y: 0.145,
    w: 0.535,
    h: 0.475
  },
  {
    slide: 34,
    type: "simulator",
    title: "Conmutación de mensajes",
    embedUrl: "../interactive_examples/message_switching/?embed=1",
    openUrl: "../interactive_examples/message_switching/",
    x: 0.075,
    y: 0.145,
    w: 0.535,
    h: 0.475
  },
  {
    slide: 45,
    type: "simulator",
    title: "Datagrama frente a circuito virtual",
    embedUrl: "../interactive_examples/datagram_vs_virtual_circuit/?embed=1",
    openUrl: "../interactive_examples/datagram_vs_virtual_circuit/",
    x: 0.075,
    y: 0.145,
    w: 0.535,
    h: 0.475
  },
  {
    slide: 50,
    type: "simulator",
    title: "Transmisión frente a propagación",
    embedUrl: "../interactive_examples/transmission_vs_propagation/?embed=1",
    openUrl: "../interactive_examples/transmission_vs_propagation/",
    x: 0.075,
    y: 0.145,
    w: 0.535,
    h: 0.475
  },
  {
    slide: 58,
    type: "simulator",
    title: "Conmutación de paquetes, overhead y retardo",
    embedUrl: "../interactive_examples/packet_switching_delay/?embed=1",
    openUrl: "../interactive_examples/packet_switching_delay/",
    x: 0.075,
    y: 0.145,
    w: 0.535,
    h: 0.475
  }
];

const FORM_OVERLAY = {
  x: 0.30,
  y: 0.17,
  w: 0.61,
  h: 0.61
};
