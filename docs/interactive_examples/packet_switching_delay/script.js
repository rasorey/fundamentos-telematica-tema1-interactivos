/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */
const $ = (id) => document.getElementById(id);
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
      const x = x0 + p * 24 + h * dx;
      const y = y0 + h * dy - 12;
      svg.append(svgEl("rect", { x, y, width: 42, height: 18, fill: colors[p % colors.length] }));
      svg.append(svgEl("rect", { x, y, width: Math.max(5, 42 * c.header / c.packetBytes), height: 18, fill: "#ffcc00" }));
    }
  }
  if (c.packets > shown) label(svg, { x: 610, y: 385, fill: "#516483", "font-size": 13 }, `Se muestran ${shown} de ${c.packets} paquetes.`);
  label(svg, { x: 150, y: 385, fill: "#17315f", "font-weight": 900 }, "La cabecera aparece en amarillo; los bloques avanzan solapados por saltos.");
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
  const warning = [];
  if (c.efficiency < 0.75) warning.push("Overhead alto: la cabecera pesa mucho frente a los datos útiles.");
  if (c.ttx > 20) warning.push("Paquetes grandes o tasa baja: el tiempo de transmisión por paquete dificulta el pipeline.");
  if (!warning.length) warning.push("El compromiso entre overhead y pipeline es razonable para estos parámetros simplificados.");
  $("warnings").innerHTML = "<strong>Interpretación:</strong> " + warning.join(" ");
  $("compareRows").innerHTML = `
    <tr><td>Paquetes con pipeline</td><td>${fmt(c.last)}</td><td>Segmentar permite solapar paquetes en distintos saltos.</td></tr>
    ${$("compareWhole").checked ? `<tr><td>Mensaje sin segmentar</td><td>${fmt(c.whole)}</td><td>Cada salto transmite el bloque completo antes de avanzar.</td></tr>` : ""}
  `;
  draw(c);
}
["messageKb","payload","header","rate","hops","prop","queue","proc","queues","compareWhole"].forEach((id) => $(id).addEventListener("input", update));
update();
