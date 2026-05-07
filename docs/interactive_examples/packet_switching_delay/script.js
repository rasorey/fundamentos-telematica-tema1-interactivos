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
const presets = {
  balanced: { messageKb: 64, payload: 1200, header: 40, rate: 10, hops: 4, prop: 2, queue: 1, proc: 0.2, queues: true },
  small: { messageKb: 64, payload: 160, header: 40, rate: 10, hops: 4, prop: 2, queue: 1, proc: 0.2, queues: true },
  large: { messageKb: 64, payload: 9000, header: 40, rate: 10, hops: 4, prop: 2, queue: 1, proc: 0.2, queues: true },
  queue: { messageKb: 64, payload: 1200, header: 40, rate: 10, hops: 4, prop: 1, queue: 25, proc: 1, queues: true },
  prop: { messageKb: 64, payload: 1200, header: 40, rate: 1000, hops: 4, prop: 35, queue: 0.2, proc: 0.1, queues: true },
};
let progress = 0.35;
let playing = false;
let timer = null;
function v(id) { return Number($(id).value); }
function fmt(ms) { return ms < 1000 ? ms.toFixed(2) + " ms" : (ms / 1000).toFixed(2) + " s"; }
function svgEl(name, attrs = {}) { const n = document.createElementNS("http://www.w3.org/2000/svg", name); Object.entries(attrs).forEach(([k,val]) => n.setAttribute(k,val)); return n; }
function label(svg, attrs, value) { const t = svgEl("text", attrs); t.textContent = value; svg.append(t); }
function calc() {
  const msgBytes = v("messageKb") * 1024;
  const payload = v("payload");
  const header = v("header");
  const packetBytes = payload + header;
  const packets = Math.ceil(msgBytes / payload);
  const ttx = packetBytes * 8 / (v("rate") * 1e6) * 1000;
  const prop = v("prop");
  const extra = $("queues").checked ? (v("queue") + v("proc")) : 0;
  const first = v("hops") * (ttx + prop + extra);
  const simplifiedLast = v("hops") * prop + (v("hops") + packets - 1) * ttx;
  const last = simplifiedLast + ($("queues").checked ? v("hops") * extra : 0);
  const wholeTx = (msgBytes + header) * 8 / (v("rate") * 1e6) * 1000;
  const whole = v("hops") * (wholeTx + prop + extra);
  const totalBytes = packets * packetBytes;
  const efficiency = msgBytes / totalBytes;
  const goodputMbps = (msgBytes * 8) / (last / 1000) / 1e6;
  return { msgBytes, payload, header, packetBytes, packets, ttx, first, last, whole, totalBytes, overhead: packets * header, efficiency, goodputMbps, hops: v("hops") };
}
function draw(c) {
  const svg = $("packetSvg");
  svg.innerHTML = "";
  const colors = ["#1f3f88", "#007c89", "#f59e0b", "#5969b3", "#138a63", "#c2413d"];
  label(svg, { x: 38, y: 35, fill: "#17315f", "font-weight": 900 }, "Diagrama espacio-tiempo simplificado");
  const shown = Math.min(c.packets, 14);
  const x0 = 120, y0 = 65, dx = 65, dy = 42;
  for (let h = 0; h <= c.hops; h++) {
    label(svg, { x: 40, y: y0 + h * dy + 5, fill: "#516483", "font-size": 12 }, h === 0 ? "origen" : "salto " + h);
    svg.append(svgEl("line", { x1: 105, y1: y0 + h * dy, x2: 870, y2: y0 + h * dy, stroke: "#e0e7f2" }));
  }
  for (let p = 0; p < shown; p++) {
    for (let h = 0; h < c.hops; h++) {
      const x = x0 + p * 24 + h * dx + progress * 26;
      const y = y0 + h * dy - 12;
      svg.append(svgEl("rect", { x, y, width: 42, height: 18, fill: colors[p % colors.length] }));
      svg.append(svgEl("rect", { x, y, width: Math.max(5, 42 * c.header / c.packetBytes), height: 18, fill: "#ffcc00" }));
    }
  }
  if (c.packets > shown) label(svg, { x: 610, y: 385, fill: "#516483", "font-size": 13 }, `Se muestran ${shown} de ${c.packets} paquetes.`);
  label(svg, { x: 150, y: 385, fill: "#17315f", "font-weight": 900 }, "La cabecera aparece en amarillo; los bloques avanzan solapados por saltos.");
  svg.append(svgEl("line", { x1: 120, y1: 405, x2: 820, y2: 405, stroke: "#c7d2e5", "stroke-width": 2 }));
  svg.append(svgEl("circle", { cx: 120 + progress * 700, cy: 405, r: 8, fill: "#c2413d" }));
  label(svg, { x: 120, y: 424, fill: "#516483", "font-size": 11 }, "primer paquete");
  label(svg, { x: 735, y: 424, fill: "#516483", "font-size": 11 }, "último paquete");
}
function drawTradeoff(c) {
  const svg = $("tradeoffSvg");
  svg.innerHTML = "";
  const sizes = [128, 256, 512, 1000, 1500, 3000, 9000];
  const chart = (x0, title, color, getter, suffix = "") => {
    const y0 = 215, w = 250, h = 145;
    label(svg, { x: x0, y: 28, fill: "#17315f", "font-weight": 900 }, title);
    svg.append(svgEl("line", { x1: x0, y1: y0, x2: x0 + w, y2: y0, stroke: "#17315f" }));
    svg.append(svgEl("line", { x1: x0, y1: y0, x2: x0, y2: y0 - h, stroke: "#17315f" }));
    const vals = sizes.map(getter);
    const max = Math.max(...vals, 1);
    let prev = null;
    sizes.forEach((s, i) => {
      const x = x0 + (i / (sizes.length - 1)) * w;
      const y = y0 - (vals[i] / max) * h;
      if (prev) svg.append(svgEl("line", { x1: prev[0], y1: prev[1], x2: x, y2: y, stroke: color, "stroke-width": 3 }));
      svg.append(svgEl("circle", { cx: x, cy: y, r: Math.abs(s - c.payload) < 80 ? 6 : 3, fill: Math.abs(s - c.payload) < 80 ? "#c2413d" : color }));
      prev = [x, y];
    });
    label(svg, { x: x0, y: 244, fill: "#516483", "font-size": 11 }, "paquete pequeño");
    label(svg, { x: x0 + 160, y: 244, fill: "#516483", "font-size": 11 }, "paquete grande");
    if (suffix) label(svg, { x: x0 + 90, y: 55, fill: "#516483", "font-size": 11 }, suffix);
  };
  const msgBytes = c.msgBytes;
  chart(55, "Eficiencia útil", "#138a63", (payload) => msgBytes / (Math.ceil(msgBytes / payload) * (payload + c.header)), "sube con payload");
  chart(345, "Retardo último paquete", "#1f3f88", (payload) => {
    const packets = Math.ceil(msgBytes / payload);
    const ttx = (payload + c.header) * 8 / (v("rate") * 1e6) * 1000;
    return c.hops * v("prop") + (c.hops + packets - 1) * ttx;
  }, "compromiso");
  chart(635, "Overhead total", "#f59e0b", (payload) => Math.ceil(msgBytes / payload) * c.header, "baja con payload");
}
function clearRows(tbody) {
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
}
function addRow(tbody, cells) {
  const tr = document.createElement("tr");
  cells.forEach((cell) => {
    const td = document.createElement("td");
    td.textContent = cell;
    tr.append(td);
  });
  tbody.append(tr);
}
function update() {
  const c = calc();
  $("hopsLabel").textContent = c.hops;
  $("packets").textContent = c.packets.toLocaleString("es-ES");
  $("overhead").textContent = c.overhead.toLocaleString("es-ES") + " B";
  $("efficiency").textContent = (c.efficiency * 100).toFixed(2) + " %";
  $("goodput").textContent = c.goodputMbps.toFixed(2) + " Mb/s";
  $("first").textContent = fmt(c.first);
  $("last").textContent = fmt(c.last);
  $("timeScrub").value = Math.round(progress * 100);
  const warning = [];
  if (c.efficiency < 0.75) warning.push("Overhead alto: la cabecera pesa mucho frente a los datos útiles.");
  if (c.ttx > 20) warning.push("Paquetes grandes o tasa baja: el tiempo de transmisión por paquete dificulta el pipeline.");
  if ($("queues").checked && (v("queue") + v("proc")) * c.hops > c.last * 0.45) warning.push("Retardo de cola/procesamiento dominante: mira cómo crece el total al activar colas.");
  if (v("prop") * c.hops > c.last * 0.45) warning.push("Propagación dominante: la distancia pesa más que el tamaño del paquete.");
  if (!warning.length) warning.push("El compromiso entre overhead y pipeline es razonable para estos parámetros simplificados.");
  $("warnings").textContent = "Interpretación: " + warning.join(" ");
  const rows = $("compareRows");
  clearRows(rows);
  addRow(rows, ["Paquetes con pipeline", fmt(c.last), "Segmentar permite solapar paquetes en distintos saltos."]);
  addRow(rows, ["Paquetes pequeños", fmt(c.last), "Mejoran el pipeline, pero multiplican cabeceras."]);
  const oldPayload = $("payload").value;
  $("payload").value = Math.min(9000, Math.max(1500, c.payload * 5));
  const large = calc();
  $("payload").value = oldPayload;
  addRow(rows, ["Paquetes grandes", fmt(large.last), "Reducen overhead, pero aumentan Ttx de cada paquete."]);
  if ($("compareWhole").checked) addRow(rows, ["Mensaje sin segmentar", fmt(c.whole), "Cada salto transmite el bloque completo antes de avanzar."]);
  draw(c);
  drawTradeoff(c);
}
function applyPreset(name) {
  const p = presets[name] || presets.balanced;
  Object.entries(p).forEach(([id, val]) => {
    if (id === "queues") $(id).checked = val;
    else $(id).value = val;
  });
  progress = 0.35;
  update();
}
["messageKb","payload","header","rate","hops","prop","queue","proc","queues","compareWhole"].forEach((id) => $(id).addEventListener("input", update));
$("preset").addEventListener("change", () => applyPreset($("preset").value));
$("timeScrub").addEventListener("input", () => { progress = Number($("timeScrub").value) / 100; update(); });
$("playBtn").addEventListener("click", () => {
  playing = !playing;
  if (timer) clearInterval(timer);
  if (!playing) return;
  timer = setInterval(() => {
    progress += 0.025;
    if (progress > 1) progress = 0;
    update();
  }, 70);
});
$("resetBtn").addEventListener("click", () => { $("preset").value = "balanced"; applyPreset("balanced"); });
$("explainBtn").addEventListener("click", () => {
  update();
  $("warnings").textContent += " El pipeline aparece porque, mientras un paquete avanza por un salto, otros paquetes pueden estar ocupando saltos anteriores.";
});
update();
