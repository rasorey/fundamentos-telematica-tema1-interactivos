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
const phases = ["Establecimiento", "Transferencia", "Liberación"];
let phase = 0;
let timer = null;
let challenge = null;
const presets = {
  steady: { hops: 4, setup: 25, rate: 10, data: 800, activity: 100, capacity: 20, release: 5 },
  bursty: { hops: 4, setup: 25, rate: 10, data: 800, activity: 25, capacity: 20, release: 5 },
  blocked: { hops: 4, setup: 25, rate: 30, data: 800, activity: 70, capacity: 20, release: 5 },
};
function value(id) { return Number($(id).value); }
function fmtMs(ms) { return ms < 1000 ? ms.toFixed(1) + " ms" : (ms / 1000).toFixed(2) + " s"; }
function svgEl(name, attrs = {}) { const n = document.createElementNS("http://www.w3.org/2000/svg", name); Object.entries(attrs).forEach(([k,v]) => n.setAttribute(k,v)); return n; }
function label(svg, attrs, value) { const t = svgEl("text", attrs); t.textContent = value; svg.append(t); }
function calc() {
  const hops = value("hops");
  const setup = hops * value("setup");
  const transfer = (value("data") * 1024 * 8) / (value("rate") * 1e6) * 1000;
  const release = hops * value("release");
  const blocked = value("rate") > value("capacity");
  return { hops, setup, transfer, release, total: setup + transfer + release, blocked };
}
function draw(c) {
  const svg = $("circuitSvg");
  svg.replaceChildren();
  const pts = Array.from({ length: c.hops + 1 }, (_, i) => [90 + i * (720 / c.hops), 165 + (i % 2 ? -45 : 45)]);
  for (let i = 0; i < pts.length - 1; i++) {
    const reserved = phase === 1 && !c.blocked;
    svg.append(svgEl("line", { x1: pts[i][0], y1: pts[i][1], x2: pts[i+1][0], y2: pts[i+1][1], stroke: c.blocked ? "#c2413d" : (reserved ? "#138a63" : "#c7d2e5"), "stroke-width": reserved ? 8 : 3, "stroke-linecap": "round" }));
    if (reserved) {
      const mx = (pts[i][0] + pts[i+1][0]) / 2;
      const my = (pts[i][1] + pts[i+1][1]) / 2;
      svg.append(svgEl("rect", { x: mx - 32, y: my - 14, width: 64, height: 22, fill: "#e8f6f1", stroke: "#138a63" }));
      label(svg, { x: mx, y: my + 2, "text-anchor": "middle", "font-size": 11, fill: "#17315f", "font-weight": 800 }, "reservado");
    }
  }
  pts.forEach((p, i) => {
    const end = i === 0 || i === pts.length - 1;
    svg.append(svgEl("circle", { cx: p[0], cy: p[1], r: end ? 25 : 19, fill: i === 0 ? "#1f3f88" : (i === pts.length - 1 ? "#1f3f88" : "#fff"), stroke: "#1f3f88", "stroke-width": 2 }));
    label(svg, { x: p[0], y: p[1] + 5, "text-anchor": "middle", fill: end ? "#fff" : "#17315f", "font-weight": 900 }, i === 0 ? "A" : (i === pts.length - 1 ? "B" : String(i)));
  });
  label(svg, { x: 450, y: 55, "text-anchor": "middle", fill: c.blocked ? "#c2413d" : "#1f3f88", "font-size": 24, "font-weight": 900 }, c.blocked ? "Bloqueo: no hay capacidad suficiente" : phases[phase]);
  const idle = Math.max(0, 100 - value("activity"));
  svg.append(svgEl("rect", { x: 240, y: 300, width: 420, height: 18, fill: "#e9edf4" }));
  svg.append(svgEl("rect", { x: 240, y: 300, width: 420 * value("activity") / 100, height: 18, fill: "#138a63" }));
  label(svg, { x: 450, y: 342, "text-anchor": "middle", fill: "#516483" }, `Uso efectivo ${value("activity")}% · capacidad ociosa ${idle}% durante la reserva`);
  label(svg, { x: 450, y: 376, "text-anchor": "middle", fill: "#17315f", "font-weight": 900 }, "línea temporal: establecimiento → transferencia → liberación");
}
function update() {
  const c = calc();
  $("hopsLabel").textContent = c.hops;
  $("activityLabel").textContent = value("activity") + " %";
  $("phase").textContent = phases[phase];
  $("total").textContent = fmtMs(c.total);
  $("util").textContent = value("activity") + " %";
  $("blocked").textContent = c.blocked ? "sí" : "no";
  $("blocked").className = c.blocked ? "status-bad" : "status-good";
  $("circuitText").textContent = c.blocked
    ? "La red no puede reservar la tasa solicitada en todos los enlaces; la llamada o flujo se bloquearía."
    : "La conmutación de circuitos reserva una ruta antes de transmitir. Tras el establecimiento, el retardo es más predecible, pero una parte de la capacidad puede quedar ociosa si el tráfico va a ráfagas.";
  draw(c);
}
["hops","setup","rate","data","activity","capacity","release"].forEach((id) => $(id).addEventListener("input", update));
function applyPreset(name) {
  const p = presets[name] || presets.bursty;
  Object.entries(p).forEach(([id, val]) => { $(id).value = val; });
  phase = 0;
  update();
}
$("preset").addEventListener("change", () => applyPreset($("preset").value));
$("phaseBtn").addEventListener("click", () => { phase = (phase + 1) % phases.length; update(); });
$("autoBtn").addEventListener("click", () => {
  if (timer) { clearInterval(timer); timer = null; $("autoBtn").textContent = "Animar"; return; }
  $("autoBtn").textContent = "Detener";
  timer = setInterval(() => { phase = (phase + 1) % phases.length; update(); }, 1100);
});
$("resetBtn").addEventListener("click", () => { $("preset").value = "bursty"; applyPreset("bursty"); });
$("explainBtn").addEventListener("click", () => {
  update();
  $("circuitText").textContent += " La zona verde representa capacidad usada; el resto de la reserva es capacidad ociosa si no hay tráfico continuo.";
});
function newChallenge() {
  const rate = [5, 10, 20, 30, 40][Math.floor(Math.random() * 5)];
  const capacity = [10, 20, 25, 35][Math.floor(Math.random() * 4)];
  challenge = { rate, capacity, blocked: rate > capacity };
  $("challengeQuestion").textContent = `Reserva solicitada: ${rate} Mb/s. Capacidad disponible por enlace: ${capacity} Mb/s. ¿Hay bloqueo?`;
  $("challengeFeedback").textContent = "";
  $("challengeFeedback").className = "challenge-feedback";
}
function checkChallenge() {
  if (!challenge) newChallenge();
  const ok = $("challengeAnswer").value === (challenge.blocked ? "sí" : "no");
  $("challengeFeedback").className = "challenge-feedback " + (ok ? "ok" : "warning");
  $("challengeFeedback").textContent = ok
    ? `Correcto: ${challenge.rate} ${challenge.blocked ? ">" : "≤"} ${challenge.capacity}, por eso ${challenge.blocked ? "la red bloquea la reserva" : "la reserva cabe en cada enlace"}.`
    : `No todavía. Compara tasa reservada y capacidad disponible: si la tasa solicitada supera la capacidad, hay bloqueo.`;
}
$("challengeNew").addEventListener("click", newChallenge);
$("challengeCheck").addEventListener("click", checkChallenge);
update();
newChallenge();
