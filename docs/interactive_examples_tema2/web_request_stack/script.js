/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse ../../../LICENSE-0BSD, ../../../LICENSE-CC0 y ../../../LICENSES.md.
 */
import { $, arrow, clear, colors, initLabPage, randomEphemeral, rect, setStatus, setText, svg, text } from "../shared/lab-utils.js";

initLabPage();

const serverIp = "203.0.113.10";
let state = { step: 0, timer: null, clientPort: randomEphemeral() };

const steps = [
  ["URL", "El usuario escribe una URL.", "app"],
  ["DNS", "El nombre se resuelve a una dirección IP.", "app"],
  ["HTTP", "La aplicación crea la petición.", "app"],
  ["TLS", "HTTPS protege la conversación.", "app"],
  ["Transporte", "TCP o QUIC añade puertos y flujo.", "transport"],
  ["IP", "IP añade origen, destino y ruta.", "internet"],
  ["Enlace", "Ethernet o Wi-Fi crea la trama local.", "link"],
  ["Físico", "El medio transmite bits o señales.", "physical"],
  ["Destino", "El servidor desencapsula en orden inverso.", "link"],
  ["Respuesta", "La respuesta vuelve al navegador.", "transport"]
];

function currentHost() {
  try {
    return new URL($("urlInput").value).hostname || "www.ejemplo.edu";
  } catch {
    return "www.ejemplo.edu";
  }
}

function transportLabel() {
  return $("transport").value === "tcp" ? "TCP + TLS" : "QUIC sobre UDP";
}

function packetParts() {
  const t = $("transport").value === "tcp" ? "H_TCP" : "H_UDP/QUIC";
  return [
    ["H_E", colors.linkSoft, colors.link],
    ["H_IP", colors.internetSoft, colors.internet],
    [t, colors.transportSoft, colors.transport],
    ["TLS + HTTP", colors.appSoft, colors.app],
    ["Datos", colors.payload, colors.line],
    ["T_E", colors.linkSoft, colors.link]
  ];
}

function renderTimeline(root) {
  const x0 = 55;
  const y = 74;
  const gap = 82;
  steps.forEach((step, index) => {
    const x = x0 + index * gap;
    const active = index === state.step;
    const color = colors[step[2]] || colors.ink;
    root.appendChild(svg("circle", { cx: x, cy: y, r: active ? 19 : 15, fill: active ? color : "#fff", stroke: color, "stroke-width": 2 }));
    root.appendChild(text(x, y, String(index + 1), { anchor: "middle", fill: active ? "#fff" : color, size: 12, weight: 850 }));
    root.appendChild(text(x, y + 34, step[0], { anchor: "middle", fill: color, size: 11, weight: 800 }));
    if (index < steps.length - 1) root.appendChild(arrow(x + 21, y, x + gap - 21, y, colors.gold, 2));
  });
}

function renderPacket(root) {
  if (!$("showPacket").checked) return;
  const x0 = 120;
  const y = 318;
  let x = x0;
  packetParts().forEach(([label, fill, stroke], index) => {
    const w = index === 4 ? 215 : index === 3 ? 128 : 84;
    root.appendChild(rect(x, y, w, 48, fill, stroke));
    root.appendChild(text(x + w / 2, y + 24, label, { anchor: "middle", fill: stroke === colors.line ? colors.ink : stroke, size: 12, weight: 850 }));
    x += w;
  });
}

function renderRoute(root) {
  const nodes = [
    [120, 205, "Cliente"],
    [360, 205, "Router"],
    [600, 205, "Servidor"],
    [800, 205, "Aplicación"]
  ];
  nodes.forEach(([x, y, label], i) => {
    const color = i === 3 ? colors.app : i === 2 ? colors.internet : colors.link;
    root.appendChild(rect(x - 62, y - 28, 124, 56, i === state.step % 4 ? colors.goldSoft : "#fff", color, { "stroke-width": i === state.step % 4 ? 3 : 1.3 }));
    root.appendChild(text(x, y, label, { anchor: "middle", fill: color, size: 13, weight: 850 }));
  });
  root.appendChild(arrow(184, 205, 296, 205, colors.link, 2));
  root.appendChild(arrow(424, 205, 536, 205, colors.internet, 2));
  root.appendChild(arrow(664, 205, 736, 205, colors.transport, 2));
  root.appendChild(text(360, 250, "salto a salto", { anchor: "middle", fill: colors.link, size: 12, weight: 850 }));
  root.appendChild(text(700, 250, "extremo a extremo", { anchor: "middle", fill: colors.transport, size: 12, weight: 850 }));
}

function render() {
  const host = currentHost();
  setText("hostOut", host);
  setText("ipOut", serverIp);
  setText("portOut", "443");
  setText("socketOut", `${$("transport").value === "tcp" ? "TCP" : "UDP"} 198.51.100.25:${state.clientPort}`);
  const root = $("traceSvg");
  clear(root);
  root.appendChild(svg("title", {}, [document.createTextNode("Traza de una petición HTTPS")]));
  renderTimeline(root);
  renderRoute(root);
  renderPacket(root);
  const step = steps[state.step];
  root.appendChild(rect(90, 392, 760, 50, colors.goldSoft, colors.gold));
  root.appendChild(text(112, 417, `${step[0]}: ${step[1]} (${transportLabel()}, ${$("link").value === "wifi" ? "Wi-Fi" : "Ethernet"})`, { fill: colors.ink, size: 14, weight: 800 }));
  setStatus("status", `${step[0]}: ${step[1]}`);
}

function step() {
  state.step = (state.step + 1) % steps.length;
  render();
}

function pause() {
  window.clearInterval(state.timer);
  state.timer = null;
}

function applyPreset(name) {
  if (name === "quic") {
    $("transport").value = "quic";
    $("link").value = "wifi";
  } else if (name === "ethernet") {
    $("transport").value = "tcp";
    $("link").value = "ethernet";
  } else {
    $("transport").value = "tcp";
    $("link").value = "wifi";
  }
  $("showPacket").checked = name !== "layers";
  state.step = 0;
  state.clientPort = randomEphemeral();
  render();
}

$("stepBtn").addEventListener("click", step);
$("animateBtn").addEventListener("click", () => {
  if (!state.timer) state.timer = window.setInterval(step, 900);
});
$("resetBtn").addEventListener("click", () => {
  pause();
  $("preset").value = "tcp";
  $("urlInput").value = "https://www.ejemplo.edu/";
  applyPreset("tcp");
});
["urlInput", "transport", "link", "showPacket"].forEach((id) => $(id).addEventListener("input", render));
$("preset").addEventListener("change", (event) => applyPreset(event.target.value));
$("challengeBtn").addEventListener("click", () => {
  const selected = document.querySelector("input[name='challenge']:checked")?.value;
  const messages = {
    socket: ["Correcto: protocolo + IP + puerto identifica el extremo de comunicación.", "ok"],
    ip: ["IP ubica la máquina, pero no el proceso o aplicación concreta.", "warn"],
    mac: ["La MAC solo sirve en el enlace local, no en toda la conversación.", "warn"],
    dns: ["DNS resuelve el nombre, pero no entrega la respuesta al proceso.", "warn"]
  };
  const [message, tone] = messages[selected] || ["Selecciona una opción.", "bad"];
  setStatus("challengeFeedback", message, tone);
});

applyPreset("tcp");
