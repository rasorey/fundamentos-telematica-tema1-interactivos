/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */
function setupEmbedUi() {
  if (new URLSearchParams(location.search).get("embed") !== "1") return;
  document.body.classList.add("embed");
  const open = document.createElement("a");
  open.className = "button embed-open";
  open.href = location.pathname;
  open.target = "_blank";
  open.rel = "noopener";
  open.textContent = "Abrir en navegador";
  document.body.append(open);
}
setupEmbedUi();
const $ = (id) => document.getElementById(id);
const speeds = { copper: 2e8, fiber: 2e8, radio: 3e8, satellite: 3e8 };
const presets = {
  lan: { packetBytes: 1500, rateMbps: 1000, distanceKm: 0.1, medium: "copper" },
  cities: { packetBytes: 1500, rateMbps: 1000, distanceKm: 1000, medium: "fiber" },
  intercontinental: { packetBytes: 1500, rateMbps: 10000, distanceKm: 8000, medium: "fiber" },
  satellite: { packetBytes: 1500, rateMbps: 100, distanceKm: 72000, medium: "satellite" },
  slowBig: { packetBytes: 64000, rateMbps: 1, distanceKm: 1, medium: "copper" },
  fastFar: { packetBytes: 1500, rateMbps: 10000, distanceKm: 10000, medium: "fiber" },
};
let progress = 0.35;
let playing = false;
let timer = null;
function fmt(seconds) {
  if (seconds < 1e-6) return (seconds * 1e9).toFixed(1) + " ns";
  if (seconds < 1e-3) return (seconds * 1e6).toFixed(1) + " µs";
  if (seconds < 1) return (seconds * 1e3).toFixed(2) + " ms";
  return seconds.toFixed(2) + " s";
}
function svgEl(name, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}
function text(svg, attrs, value) {
  const node = svgEl("text", attrs);
  node.textContent = value;
  svg.append(node);
}
function draw(ttx, tprop, total) {
  const svg = $("txSvg");
  svg.innerHTML = "";
  const lineY = 145;
  const txFraction = total ? Math.max(0.02, Math.min(0.98, ttx / total)) : 0.5;
  const p = Math.max(0, Math.min(1, progress));
  const firstBitX = 130 + p * 650;
  const lastBitX = 130 + Math.max(0, (p - txFraction) / Math.max(0.01, 1 - txFraction)) * 650;
  const txWidth = Math.max(16, Math.min(260, 35 + txFraction * 300));
  svg.append(svgEl("line", { x1: 120, y1: lineY, x2: 780, y2: lineY, stroke: "#c7d2e5", "stroke-width": 8, "stroke-linecap": "round" }));
  svg.append(svgEl("circle", { cx: 95, cy: lineY, r: 34, fill: "#1f3f88" }));
  svg.append(svgEl("circle", { cx: 805, cy: lineY, r: 34, fill: "#1f3f88" }));
  text(svg, { x: 95, y: lineY + 5, fill: "#fff", "text-anchor": "middle", "font-weight": 900 }, "Tx");
  text(svg, { x: 805, y: lineY + 5, fill: "#fff", "text-anchor": "middle", "font-weight": 900 }, "Rx");
  svg.append(svgEl("rect", { x: 130, y: 92, width: txWidth, height: 36, fill: "#f59e0b" }));
  text(svg, { x: 130 + txWidth / 2, y: 115, fill: "#17315f", "text-anchor": "middle", "font-weight": 900, "font-size": 13 }, "paquete entra bit a bit");
  svg.append(svgEl("circle", { cx: firstBitX, cy: lineY, r: 15, fill: "#007c89" }));
  svg.append(svgEl("circle", { cx: firstBitX, cy: lineY, r: 30, fill: "none", stroke: "#007c89", "stroke-width": 2, opacity: .45 }));
  svg.append(svgEl("rect", { x: lastBitX - 6, y: lineY - 20, width: 12, height: 40, fill: "#1f3f88", opacity: .85 }));
  text(svg, { x: firstBitX, y: lineY + 54, fill: "#007c89", "text-anchor": "middle", "font-weight": 900, "font-size": 12 }, "primer bit");
  text(svg, { x: lastBitX, y: lineY - 36, fill: "#1f3f88", "text-anchor": "middle", "font-weight": 900, "font-size": 12 }, "último bit");
  svg.append(svgEl("line", { x1: 130, y1: 260, x2: 780, y2: 260, stroke: "#c7d2e5", "stroke-width": 2 }));
  svg.append(svgEl("rect", { x: 130, y: 252, width: 650 * txFraction, height: 16, fill: "#f59e0b" }));
  svg.append(svgEl("rect", { x: 130 + 650 * txFraction, y: 252, width: 650 * (1 - txFraction), height: 16, fill: "#007c89" }));
  svg.append(svgEl("circle", { cx: 130 + p * 650, cy: 260, r: 8, fill: "#c2413d" }));
  text(svg, { x: 210, y: 300, fill: "#17315f", "text-anchor": "middle", "font-weight": 900 }, "Ttx: meter bits");
  text(svg, { x: 630, y: 300, fill: "#17315f", "text-anchor": "middle", "font-weight": 900 }, "Tprop: viaje físico");
  text(svg, { x: 450, y: 335, fill: "#516483", "text-anchor": "middle" }, "Aumentar R reduce Ttx, pero no reduce Tprop. En enlaces largos, la física importa.");
}
function update() {
  const packetBytes = Number($("packetBytes").value);
  const rateMbps = Number($("rateMbps").value);
  const distanceKm = Number($("distanceKm").value);
  const medium = $("medium").value;
  const ttx = packetBytes * 8 / (rateMbps * 1e6);
  const tprop = distanceKm * 1000 / speeds[medium];
  const total = ttx + tprop;
  const txP = total ? (ttx / total) * 100 : 0;
  const propP = total ? (tprop / total) * 100 : 0;
  $("ttx").textContent = fmt(ttx);
  $("tprop").textContent = fmt(tprop);
  $("total").textContent = fmt(total);
  $("dominant").textContent = ttx > tprop ? "transmisión" : "propagación";
  $("txPercent").textContent = txP.toFixed(1) + " %";
  $("propPercent").textContent = propP.toFixed(1) + " %";
  $("txBar").style.width = txP + "%";
  $("propBar").style.width = propP + "%";
  const dominant = ttx > tprop
    ? "En este caso domina el tiempo de transmisión: el enlace tarda más en introducir todos los bits que la señal en recorrer la distancia."
    : "En este caso domina el tiempo de propagación: aunque el enlace pueda tener mucho caudal, la distancia física marca una latencia importante.";
  const satelliteNote = medium === "satellite" && distanceKm >= 70000
    ? " En el preset satélite, 72.000 km representa una ruta aproximada subida+bajada vía satélite geoestacionario, no un único tramo simple."
    : "";
  $("explanation").textContent = dominant + " Más Mb/s no siempre significa menor latencia." + satelliteNote;
  $("timeScrub").value = Math.round(progress * 100);
  $("animSpeedLabel").textContent = Number($("animSpeed").value).toFixed(1).replace(".0", "") + "×";
  draw(ttx, tprop, total);
}
$("preset").addEventListener("change", () => {
  const p = presets[$("preset").value];
  if (!p) return;
  $("packetBytes").value = p.packetBytes;
  $("rateMbps").value = p.rateMbps;
  $("distanceKm").value = p.distanceKm;
  $("medium").value = p.medium;
  update();
});
["packetBytes", "rateMbps", "distanceKm", "medium"].forEach((id) => $(id).addEventListener("input", update));
$("timeScrub").addEventListener("input", () => {
  progress = Number($("timeScrub").value) / 100;
  update();
});
$("animSpeed").addEventListener("input", update);
$("playBtn").addEventListener("click", () => {
  playing = !playing;
  if (timer) clearInterval(timer);
  if (!playing) return;
  timer = setInterval(() => {
    progress += 0.018 * Number($("animSpeed").value);
    if (progress > 1) progress = 0;
    update();
  }, 60);
});
$("resetBtn").addEventListener("click", () => {
  $("preset").value = "lan";
  $("preset").dispatchEvent(new Event("change"));
  progress = 0.35;
  update();
});
$("explainBtn").addEventListener("click", () => {
  update();
  $("explanation").textContent += " Observa que Ttx depende de L/R, mientras Tprop depende de d/v: son dos relojes distintos.";
});
update();
