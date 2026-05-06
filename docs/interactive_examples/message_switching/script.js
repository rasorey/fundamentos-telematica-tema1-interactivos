/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */
const $ = (id) => document.getElementById(id);
let activeHop = 0;
let timer = null;
function v(id) { return Number($(id).value); }
function fmt(ms) { return ms < 1000 ? ms.toFixed(1) + " ms" : (ms / 1000).toFixed(2) + " s"; }
function svgEl(name, attrs = {}) { const n = document.createElementNS("http://www.w3.org/2000/svg", name); Object.entries(attrs).forEach(([k,val]) => n.setAttribute(k,val)); return n; }
function label(svg, attrs, value) { const t = svgEl("text", attrs); t.textContent = value; svg.append(t); }
function calc() {
  const tx = v("messageKb") * 1024 * 8 / (v("rateMbps") * 1e6) * 1000;
  const perHop = tx + v("queueMs") + v("procMs");
  const total = v("hops") * perHop;
  const packets = Math.ceil(v("messageKb") * 1024 / 1000);
  const packetTx = (1040 * 8) / (v("rateMbps") * 1e6) * 1000;
  const packetApprox = v("hops") * (packetTx + v("queueMs") + v("procMs")) + (packets - 1) * packetTx;
  return { tx, perHop, total, packets, packetApprox, bufferWarn: v("messageKb") > v("bufferKb") };
}
function draw(c) {
  const svg = $("messageSvg");
  svg.innerHTML = "";
  const hops = v("hops");
  const top = 85, left = 110, right = 800;
  const pts = Array.from({ length: hops + 1 }, (_, i) => [left + i * (right - left) / hops, top]);
  for (let i = 0; i < pts.length - 1; i++) svg.append(svgEl("line", { x1: pts[i][0] + 24, y1: top, x2: pts[i+1][0] - 24, y2: top, stroke: "#c7d2e5", "stroke-width": 3 }));
  pts.forEach((p, i) => {
    svg.append(svgEl("circle", { cx: p[0], cy: p[1], r: 25, fill: i === 0 || i === pts.length - 1 ? "#1f3f88" : "#fff", stroke: "#1f3f88", "stroke-width": 2 }));
    label(svg, { x: p[0], y: p[1] + 5, "text-anchor": "middle", fill: i === 0 || i === pts.length - 1 ? "#fff" : "#17315f", "font-weight": 900 }, i === 0 ? "A" : (i === pts.length - 1 ? "B" : "N" + i));
    if (i > 0 && i < pts.length - 1) {
      svg.append(svgEl("rect", { x: p[0] - 42, y: 130, width: 84, height: 30, fill: "#fff7d1", stroke: "#f59e0b" }));
      label(svg, { x: p[0], y: 150, "text-anchor": "middle", fill: "#17315f", "font-size": 12 }, "buffer/cola");
    }
  });
  const idx = Math.min(activeHop, hops - 1);
  const start = pts[idx][0] + 30;
  const end = pts[idx + 1][0] - 70;
  svg.append(svgEl("rect", { x: start, y: 50, width: Math.max(48, end - start), height: 30, fill: c.bufferWarn ? "#c2413d" : "#5969b3" }));
  label(svg, { x: start + Math.max(48, end - start) / 2, y: 70, "text-anchor": "middle", fill: "#fff", "font-size": 12, "font-weight": 900 }, "mensaje completo");

  label(svg, { x: 58, y: 215, fill: "#516483", "font-weight": 900 }, "Diagrama espacio-tiempo");
  const rowGap = 32, x0 = 180, y0 = 205;
  for (let h = 0; h <= hops; h++) {
    label(svg, { x: 95, y: y0 + h * rowGap + 5, fill: "#17315f", "font-size": 12 }, h === 0 ? "A" : (h === hops ? "B" : "N" + h));
    svg.append(svgEl("line", { x1: 160, y1: y0 + h * rowGap, x2: 820, y2: y0 + h * rowGap, stroke: "#e0e7f2" }));
  }
  for (let h = 0; h < hops; h++) {
    const x = x0 + h * 95;
    const y = y0 + h * rowGap;
    svg.append(svgEl("polygon", { points: `${x},${y-10} ${x+95},${y+rowGap-10} ${x+95},${y+rowGap+10} ${x},${y+10}`, fill: "#eaf1fb", stroke: "#1f3f88" }));
  }
}
function update() {
  const c = calc();
  $("hopsLabel").textContent = v("hops");
  $("txHop").textContent = fmt(c.tx);
  $("total").textContent = fmt(c.total);
  $("buffer").textContent = c.bufferWarn ? "no cabe" : Math.round((v("messageKb") / v("bufferKb")) * 100) + " %";
  $("buffer").className = c.bufferWarn ? "status-bad" : "status-good";
  $("compare").textContent = fmt(c.packetApprox);
  $("messageText").textContent = c.bufferWarn
    ? "Advertencia: el mensaje completo no cabe en el buffer configurado. La conmutación de mensajes requiere almacenar el bloque entero antes de reenviarlo."
    : "Los mensajes grandes penalizan el retardo y el almacenamiento porque cada nodo debe recibir todo el mensaje antes de transmitirlo al siguiente salto. La segmentación en paquetes permite solapar saltos.";
  draw(c);
}
["messageKb","rateMbps","hops","queueMs","procMs","bufferKb"].forEach((id) => $(id).addEventListener("input", () => { activeHop = 0; update(); }));
$("stepBtn").addEventListener("click", () => { activeHop = (activeHop + 1) % v("hops"); update(); });
$("playBtn").addEventListener("click", () => {
  if (timer) { clearInterval(timer); timer = null; $("playBtn").textContent = "Animar"; return; }
  $("playBtn").textContent = "Detener";
  timer = setInterval(() => { activeHop = (activeHop + 1) % v("hops"); update(); }, 900);
});
update();
