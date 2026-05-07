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
let challenge = null;
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
  svg.replaceChildren();
  const lineY = 145;
  const txFraction = total ? Math.max(0.02, Math.min(0.98, ttx / total)) : 0.5;
  const p = Math.max(0, Math.min(1, progress));
  const elapsed = p * total;
  const propagationTime = Math.max(tprop, 1e-12);
  const firstBitPosition = Math.max(0, Math.min(1, elapsed / propagationTime));
  const lastBitPosition = Math.max(0, Math.min(1, (elapsed - ttx) / propagationTime));
  const firstBitX = 130 + firstBitPosition * 650;
  const lastBitX = 130 + lastBitPosition * 650;
  const lastBitHasLeft = elapsed >= ttx;
  const packetStartX = Math.min(lastBitX, firstBitX);
  const packetWidth = Math.max(0, Math.abs(firstBitX - lastBitX));
  const txWidth = Math.max(16, Math.min(260, 35 + txFraction * 300));
  const timelineX = 180;
  const timelineLen = 600;
  const timeX = (seconds) => timelineX + Math.max(0, Math.min(1, seconds / Math.max(total, 1e-12))) * timelineLen;
  const currentX = timeX(elapsed);
  const firstArrivalX = timeX(tprop);
  const firstArrivalNearStart = firstArrivalX < timelineX + 145;
  svg.append(svgEl("rect", { x: 120, y: lineY - 22, width: 660, height: 44, rx: 22, fill: "#eef3fb", stroke: "#c7d2e5", "stroke-width": 2 }));
  if (packetWidth > 1) {
    svg.append(svgEl("rect", { x: packetStartX, y: lineY - 18, width: packetWidth, height: 36, rx: 10, fill: "#f59e0b", opacity: .92 }));
    for (let x = packetStartX + 18; x < packetStartX + packetWidth - 4; x += 28) {
      svg.append(svgEl("line", { x1: x, y1: lineY - 16, x2: x, y2: lineY + 16, stroke: "#fff7df", "stroke-width": 2, opacity: .75 }));
    }
  }
  svg.append(svgEl("circle", { cx: 95, cy: lineY, r: 34, fill: "#1f3f88" }));
  svg.append(svgEl("circle", { cx: 805, cy: lineY, r: 34, fill: "#1f3f88" }));
  text(svg, { x: 95, y: lineY + 5, fill: "#fff", "text-anchor": "middle", "font-weight": 900 }, "Tx");
  text(svg, { x: 805, y: lineY + 5, fill: "#fff", "text-anchor": "middle", "font-weight": 900 }, "Rx");
  svg.append(svgEl("line", { x1: firstBitX, y1: lineY - 30, x2: firstBitX, y2: lineY + 30, stroke: "#007c89", "stroke-width": 4, "stroke-linecap": "round" }));
  svg.append(svgEl("line", { x1: lastBitX, y1: lineY - 30, x2: lastBitX, y2: lineY + 30, stroke: "#1f3f88", "stroke-width": 4, "stroke-linecap": "round", opacity: lastBitHasLeft ? 1 : .35 }));
  text(svg, { x: Math.min(Math.max(firstBitX, 170), 740), y: lineY + 58, fill: "#007c89", "text-anchor": "middle", "font-weight": 900, "font-size": 12 }, "primer bit");
  text(svg, { x: lastBitHasLeft ? Math.min(Math.max(lastBitX, 170), 740) : 210, y: lastBitHasLeft ? lineY - 42 : lineY + 78, fill: "#1f3f88", "text-anchor": "middle", "font-weight": 900, "font-size": 12 }, lastBitHasLeft ? "último bit" : "último bit aún no sale");
  svg.append(svgEl("rect", { x: 130, y: 82, width: txWidth, height: 34, rx: 8, fill: "#fef3c7", stroke: "#f59e0b", "stroke-width": 2 }));
  text(svg, { x: 130 + txWidth / 2, y: 104, fill: "#17315f", "text-anchor": "middle", "font-weight": 900, "font-size": 12 }, "transmisión: el emisor mete bits");
  text(svg, { x: 450, y: 45, fill: "#17315f", "text-anchor": "middle", "font-weight": 900, "font-size": 16 }, "El rectángulo naranja es el paquete ocupando el enlace en este instante");

  text(svg, { x: 88, y: 262, fill: "#516483", "font-weight": 900, "font-size": 12 }, "Emisor");
  text(svg, { x: 88, y: 302, fill: "#516483", "font-weight": 900, "font-size": 12 }, "Primer bit");
  text(svg, { x: 88, y: 342, fill: "#516483", "font-weight": 900, "font-size": 12 }, "Último bit");
  svg.append(svgEl("line", { x1: timelineX, y1: 352, x2: timelineX + timelineLen, y2: 352, stroke: "#c7d2e5", "stroke-width": 2 }));
  svg.append(svgEl("rect", { x: timeX(0), y: 246, width: Math.max(2, timeX(ttx) - timeX(0)), height: 22, rx: 6, fill: "#f59e0b" }));
  text(svg, { x: (timeX(0) + timeX(ttx)) / 2, y: 262, fill: "#17315f", "text-anchor": "middle", "font-weight": 900, "font-size": 12 }, "Ttx");
  svg.append(svgEl("line", { x1: timeX(0), y1: 298, x2: timeX(tprop), y2: 298, stroke: "#007c89", "stroke-width": 8, "stroke-linecap": "round" }));
  svg.append(svgEl("line", { x1: timeX(ttx), y1: 338, x2: timeX(total), y2: 338, stroke: "#1f3f88", "stroke-width": 8, "stroke-linecap": "round" }));
  text(svg, { x: firstArrivalNearStart ? firstArrivalX + 10 : firstArrivalX, y: 288, fill: "#007c89", "text-anchor": firstArrivalNearStart ? "start" : "end", "font-weight": 900, "font-size": 12 }, "llega primer bit");
  text(svg, { x: timeX(total), y: 328, fill: "#1f3f88", "text-anchor": "end", "font-weight": 900, "font-size": 12 }, "llega último bit");
  svg.append(svgEl("line", { x1: currentX, y1: 238, x2: currentX, y2: 356, stroke: "#c2413d", "stroke-width": 2, "stroke-dasharray": "5 5" }));
  svg.append(svgEl("circle", { cx: currentX, cy: 352, r: 7, fill: "#c2413d" }));
  text(svg, { x: 450, y: 395, fill: "#516483", "text-anchor": "middle" }, "Ambos bordes del paquete avanzan con la misma velocidad; la cola sale Ttx después del frente.");
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
function calcCase(c) {
  const ttx = c.packetBytes * 8 / (c.rateMbps * 1e6);
  const tprop = c.distanceKm * 1000 / speeds[c.medium];
  return { ttx, tprop, dominant: ttx > tprop ? "transmisión" : "propagación" };
}
function newChallenge() {
  const keys = ["lan", "cities", "intercontinental", "satellite", "slowBig", "fastFar"];
  const key = keys[Math.floor(Math.random() * keys.length)];
  const c = presets[key];
  challenge = { key, ...c, ...calcCase(c) };
  $("challengeQuestion").textContent = `Caso: ${c.packetBytes.toLocaleString("es-ES")} B, ${c.rateMbps} Mb/s, ${c.distanceKm.toLocaleString("es-ES")} km. ¿Qué domina?`;
  $("challengeFeedback").textContent = "";
  $("challengeFeedback").className = "challenge-feedback";
}
function checkChallenge() {
  if (!challenge) newChallenge();
  const given = $("challengeAnswer").value;
  const ok = given === challenge.dominant;
  $("challengeFeedback").className = "challenge-feedback " + (ok ? "ok" : "warning");
  $("challengeFeedback").textContent = ok
    ? `Correcto: Ttx = ${fmt(challenge.ttx)} y Tprop = ${fmt(challenge.tprop)}.`
    : `No todavía. Calcula Ttx = L/R y Tprop = d/v: salen ${fmt(challenge.ttx)} y ${fmt(challenge.tprop)}.`;
}
$("challengeNew").addEventListener("click", newChallenge);
$("challengeCheck").addEventListener("click", checkChallenge);
update();
newChallenge();
