/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse ../../../LICENSE-0BSD, ../../../LICENSE-CC0 y ../../../LICENSES.md.
 */
import { $, arrow, clear, colors, fmtBytes, initLabPage, pct, rect, setStatus, setText, svg, text } from "../shared/lab-utils.js";

initLabPage();

const presets = {
  "http-small": { data: "GET /", transport: "tcp", trailer: true, depth: 0 },
  "dns-udp": { data: "consulta DNS ejemplo.edu", transport: "udp", trailer: true, depth: 2 },
  large: { data: "payload ".repeat(170), transport: "tcp", trailer: true, depth: 3 },
  quic: { data: "petición HTTPS sobre QUIC", transport: "quic", trailer: true, depth: 2 }
};

const headerBytes = {
  tcp: 20,
  udp: 8,
  quic: 8,
  ip: 20,
  link: 14,
  trailer: 4
};

let state = { ...presets["http-small"] };

function byteLength(str) {
  return Math.max(20, new TextEncoder().encode(str).length);
}

function transportName() {
  return state.transport === "tcp" ? "TCP" : state.transport === "udp" ? "UDP" : "QUIC";
}

function currentParts() {
  const appBytes = byteLength(state.data);
  const parts = [{ label: "Payload", bytes: appBytes, fill: colors.payload, stroke: colors.line, layer: "Datos" }];
  if (state.depth >= 1) parts.unshift({ label: "H_T", bytes: headerBytes[state.transport], fill: colors.transportSoft, stroke: colors.transport, layer: transportName() });
  if (state.depth >= 2) parts.unshift({ label: "H_IP", bytes: headerBytes.ip, fill: colors.internetSoft, stroke: colors.internet, layer: "IP" });
  if (state.depth >= 3) {
    parts.unshift({ label: "H_E", bytes: headerBytes.link, fill: colors.linkSoft, stroke: colors.link, layer: "Enlace" });
    if (state.trailer) parts.push({ label: "T_E", bytes: headerBytes.trailer, fill: colors.linkSoft, stroke: colors.link, layer: "Enlace" });
  }
  return parts;
}

function unitName() {
  return ["Datos", `${transportName()} PDU`, "Paquete IP", "Trama"][state.depth];
}

function render() {
  const parts = currentParts();
  const appBytes = byteLength(state.data);
  const total = parts.reduce((sum, part) => sum + part.bytes, 0);
  const control = total - appBytes;
  setText("totalBytes", fmtBytes(total));
  setText("overhead", pct(control / total));
  setText("efficiency", pct(appBytes / total));
  setText("unitName", unitName());
  setStatus("status", `${unitName()}: ${fmtBytes(appBytes)} de datos útiles y ${fmtBytes(control)} de control.`);

  const root = $("pduSvg");
  clear(root);
  root.appendChild(svg("title", {}, [document.createTextNode("Constructor visual de SDU y PDU")]));
  const y = 190;
  const x0 = 85;
  const totalWidth = 745;
  let x = x0;
  parts.forEach((part) => {
    const w = Math.max(54, (part.bytes / total) * totalWidth);
    root.appendChild(rect(x, y, w, 64, part.fill, part.stroke, { "stroke-width": 1.6 }));
    root.appendChild(text(x + w / 2, y + 24, part.label, { anchor: "middle", fill: part.stroke, size: 14, weight: 850 }));
    root.appendChild(text(x + w / 2, y + 45, fmtBytes(part.bytes), { anchor: "middle", fill: colors.ink, size: 11, weight: 650 }));
    x += w;
  });

  const steps = [
    ["Aplicación", "Datos de usuario", colors.app, state.depth === 0],
    [transportName(), "Añade cabecera de transporte", colors.transport, state.depth === 1],
    ["IP", "Añade dirección origen/destino", colors.internet, state.depth === 2],
    ["Enlace", "Añade cabecera y trailer local", colors.link, state.depth === 3]
  ];
  steps.forEach((step, i) => {
    const sx = 90 + i * 210;
    root.appendChild(rect(sx, 62, 158, 52, step[3] ? "#fff7cc" : "#fff", step[2], { "stroke-width": step[3] ? 3 : 1.3 }));
    root.appendChild(text(sx + 79, 82, step[0], { anchor: "middle", fill: step[2], size: 14, weight: 850 }));
    root.appendChild(text(sx + 79, 102, step[1], { anchor: "middle", fill: colors.ink, size: 10, weight: 550 }));
    if (i < steps.length - 1) root.appendChild(arrow(sx + 160, 88, sx + 205, 88, colors.gold, 2));
  });

  root.appendChild(text(90, 315, "Lectura", { fill: colors.ink, size: 16, weight: 850 }));
  root.appendChild(text(90, 344, "SDU: lo recibido desde arriba. PDU: SDU más control de esta capa.", { fill: colors.ink, size: 14, weight: 650 }));
  root.appendChild(text(90, 372, "El payload permanece neutro; cada cabecera usa el color de su capa.", { fill: colors.ink, size: 14, weight: 650 }));
}

function syncControls() {
  $("appData").value = state.data;
  $("transport").value = state.transport;
  $("trailer").checked = state.trailer;
}

function applyPreset(name) {
  state = { ...presets[name] };
  syncControls();
  render();
}

$("preset").addEventListener("change", (event) => applyPreset(event.target.value));
$("appData").addEventListener("input", (event) => { state.data = event.target.value; render(); });
$("transport").addEventListener("change", (event) => { state.transport = event.target.value; render(); });
$("trailer").addEventListener("change", (event) => { state.trailer = event.target.checked; render(); });
$("addLayer").addEventListener("click", () => { state.depth = Math.min(3, state.depth + 1); render(); });
$("removeLayer").addEventListener("click", () => { state.depth = Math.max(0, state.depth - 1); render(); });
$("resetBtn").addEventListener("click", () => {
  $("preset").value = "http-small";
  applyPreset("http-small");
});
$("challengeBtn").addEventListener("click", () => {
  const parts = currentParts();
  const total = parts.reduce((sum, part) => sum + part.bytes, 0);
  const appBytes = byteLength(state.data);
  const ok = state.depth === 3 && appBytes <= 40 && (total - appBytes) / total > 0.5;
  setStatus(
    "challengeFeedback",
    ok ? "Correcto: con datos pequeños, el control pesa más que el payload." : "Aún no: usa un dato corto y añade transporte, IP y enlace.",
    ok ? "ok" : "warn"
  );
});

syncControls();
render();
