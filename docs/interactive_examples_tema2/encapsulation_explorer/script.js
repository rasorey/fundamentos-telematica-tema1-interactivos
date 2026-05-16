/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse ../../../LICENSE-0BSD, ../../../LICENSE-CC0 y ../../../LICENSES.md.
 */
import { $, arrow, clear, colors, fmtBytes, initLabPage, line, pct, rect, setStatus, svg, text } from "../shared/lab-utils.js";

initLabPage();

const stacks = {
  two: [
    { name: "Nivel 2", key: "app", service: "presenta datos al nivel superior" },
    { name: "Nivel 1", key: "link", service: "usa el medio físico" }
  ],
  tcpip: [
    { name: "Aplicación", key: "app", service: "datos para el usuario" },
    { name: "Transporte", key: "transport", service: "procesos extremo a extremo" },
    { name: "Internet", key: "internet", service: "encaminamiento entre redes" },
    { name: "Acceso a red", key: "link", service: "trama y medio local" }
  ],
  osi: [
    { name: "Aplicación", key: "app", service: "servicios para programas" },
    { name: "Presentación", key: "app", service: "formato y cifrado" },
    { name: "Sesión", key: "app", service: "diálogo y estado" },
    { name: "Transporte", key: "transport", service: "extremo a extremo" },
    { name: "Red", key: "internet", service: "encaminamiento" },
    { name: "Enlace", key: "link", service: "salto local" },
    { name: "Físico", key: "physical", service: "bits y señales" }
  ]
};

const fill = {
  app: colors.appSoft,
  transport: colors.transportSoft,
  internet: colors.internetSoft,
  link: colors.linkSoft,
  physical: colors.physicalSoft
};

const stroke = {
  app: colors.app,
  transport: colors.transport,
  internet: colors.internet,
  link: colors.link,
  physical: colors.physical
};

let state = { stack: "tcpip", mode: "both", currentStep: 0, payloadSize: 500, timer: null };

function controlBytes(layer) {
  if (layer.key === "transport") return 20;
  if (layer.key === "internet") return 20;
  if (layer.key === "link") return 18;
  if (layer.key === "app" && ["Sesión", "Presentación"].includes(layer.name)) return 5;
  return 0;
}

function overheadBytes(layers) {
  return layers.reduce((sum, layer) => sum + controlBytes(layer), 0);
}

function updateOverhead(layers) {
  const overhead = overheadBytes(layers);
  const total = state.payloadSize + overhead;
  $("payloadLabel").textContent = fmtBytes(state.payloadSize);
  $("overheadLabel").textContent = fmtBytes(overhead);
  $("overheadDetail").textContent = `de control · ${pct(overhead / total)} del total`;
  return { overhead, total };
}

function pathSteps(layers) {
  const down = layers.map((layer, index) => ({ side: "A", index, layer, label: `${layer.name} en origen` }));
  const up = [...layers].reverse().map((layer, offset) => {
    const index = layers.length - 1 - offset;
    return { side: "B", index, layer, label: `${layer.name} en destino` };
  });
  return [...down, { side: "medio", index: layers.length - 1, layer: layers[layers.length - 1], label: "medio físico" }, ...up];
}

function drawLayer(g, x, y, w, h, layer, active) {
  const color = stroke[layer.key] || colors.ink;
  g.appendChild(rect(x, y, w, h, active ? "#fff7cc" : fill[layer.key], color, { "stroke-width": active ? 3 : 1.4 }));
  g.appendChild(text(x + 14, y + h / 2, layer.name, { fill: color, size: 15, weight: 800 }));
  g.appendChild(text(x + w - 16, y + h / 2, layer.service, { fill: colors.ink, size: 11, weight: 550, anchor: "end" }));
}

function render() {
  const layers = stacks[state.stack];
  const packet = updateOverhead(layers);
  const steps = pathSteps(layers);
  state.currentStep %= steps.length;
  const current = steps[state.currentStep];
  const root = $("stackSvg");
  clear(root);
  root.appendChild(svg("title", {}, [document.createTextNode("Explorador de comunicación lógica y flujo real")]));

  const top = 62;
  const h = Math.min(62, Math.floor(330 / layers.length));
  const gap = 7;
  const hostA = { x: 70, y: top, w: 260 };
  const hostB = { x: 570, y: top, w: 260 };

  root.appendChild(text(hostA.x + hostA.w / 2, 34, "Host A", { anchor: "middle", size: 16, weight: 850 }));
  root.appendChild(text(hostB.x + hostB.w / 2, 34, "Host B", { anchor: "middle", size: 16, weight: 850 }));

  layers.forEach((layer, index) => {
    const y = top + index * (h + gap);
    const activeA = current.side === "A" && current.index === index;
    const activeB = current.side === "B" && current.index === index;
    drawLayer(root, hostA.x, y, hostA.w, h, layer, activeA);
    drawLayer(root, hostB.x, y, hostB.w, h, layer, activeB);
    if (state.mode !== "real") {
      root.appendChild(line(hostA.x + hostA.w + 12, y + h / 2, hostB.x - 12, y + h / 2, stroke[layer.key], index === current.index ? 3 : 2, {
        "stroke-dasharray": "10 8",
        opacity: index === current.index ? 1 : .45
      }));
      root.appendChild(text(450, y + h / 2 - 12, "protocolo entre pares", { anchor: "middle", fill: stroke[layer.key], size: 10, weight: 700 }));
    }
  });

  const mediumY = top + layers.length * (h + gap) + 28;
  root.appendChild(rect(60, mediumY, 780, 38, "#f6f7f9", colors.physical, { rx: 3, ry: 3 }));
  root.appendChild(text(450, mediumY + 19, "Medio físico: transporta bits; la lógica de pares es una abstracción", {
    anchor: "middle",
    fill: colors.physical,
    size: 13,
    weight: 750
  }));
  root.appendChild(rect(255, mediumY + 92, 390, 38, "#fff7ed", colors.warn, { rx: 4, ry: 4 }));
  root.appendChild(text(450, mediumY + 111, `Payload ${fmtBytes(state.payloadSize)} + control ${fmtBytes(packet.overhead)} = ${fmtBytes(packet.total)}`, {
    anchor: "middle",
    fill: colors.ink,
    size: 13,
    weight: 850
  }));

  if (state.mode !== "logical") {
    const xA = hostA.x + hostA.w + 34;
    const xB = hostB.x - 34;
    const yTop = top + h / 2;
    const yBottom = top + (layers.length - 1) * (h + gap) + h / 2;
    root.appendChild(arrow(xA, yTop, xA, yBottom, colors.link, 3));
    root.appendChild(arrow(xA, yBottom, xA + 62, mediumY + 19, colors.link, 3));
    root.appendChild(arrow(xA + 62, mediumY + 19, xB - 62, mediumY + 19, colors.physical, 3));
    root.appendChild(arrow(xB - 62, mediumY + 19, xB, yBottom, colors.link, 3));
    root.appendChild(arrow(xB, yBottom, xB, yTop, colors.link, 3));
    root.appendChild(text(450, mediumY + 62, "flujo real: baja, cruza el medio y sube", { anchor: "middle", fill: colors.link, size: 13, weight: 850 }));
  }

  const relation = current.side === "medio"
    ? "El dato atraviesa el medio como señales o bits."
    : current.side === "A"
      ? `El dato baja por la interfaz local de ${current.layer.name}.`
      : `En destino, ${current.layer.name} interpreta su información y entrega el payload hacia arriba.`;
  setStatus("status", `${current.label}. ${relation}`);

  const legend = $("legend");
  legend.innerHTML = `
    <span class="token app">Aplicación</span>
    <span class="token transport">Transporte</span>
    <span class="token internet">Internet/red</span>
    <span class="token link">Enlace</span>
    <span class="token physical">Físico</span>
  `;
}

function nextStep() {
  state.currentStep += 1;
  render();
}

function animate() {
  if (state.timer) return;
  state.timer = window.setInterval(nextStep, 950);
}

function pause() {
  window.clearInterval(state.timer);
  state.timer = null;
}

$("stackSelect").addEventListener("change", (event) => {
  state.stack = event.target.value;
  state.currentStep = 0;
  render();
});

$("modeSelect").addEventListener("change", (event) => {
  state.mode = event.target.value;
  render();
});

$("payloadSize").addEventListener("input", (event) => {
  state.payloadSize = Number(event.target.value);
  render();
});

$("stepBtn").addEventListener("click", nextStep);
$("animateBtn").addEventListener("click", animate);
$("pauseBtn").addEventListener("click", pause);
$("resetBtn").addEventListener("click", () => {
  pause();
  state = { ...state, stack: "tcpip", mode: "both", currentStep: 0, payloadSize: 500 };
  $("stackSelect").value = "tcpip";
  $("modeSelect").value = "both";
  $("payloadSize").value = "500";
  render();
});

$("challengeBtn").addEventListener("click", () => {
  const layers = stacks[state.stack];
  const current = pathSteps(layers)[state.currentStep % pathSteps(layers).length];
  const ok = state.stack !== "two" && state.mode !== "real" && current.layer.name === "Transporte";
  setStatus(
    "challengeFeedback",
    ok ? "Correcto: estás mirando la comunicación lógica entre entidades de transporte." : "Aún no: usa TCP/IP u OSI, activa comunicación lógica y avanza hasta transporte.",
    ok ? "ok" : "warn"
  );
});

render();
