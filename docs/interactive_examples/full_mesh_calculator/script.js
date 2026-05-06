/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */
const $ = (id) => document.getElementById(id);
const svg = $("meshSvg");
const nodesInput = $("nodes");

function svgEl(name, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}
function label(attrs, text) {
  const node = svgEl("text", attrs);
  node.textContent = text;
  svg.append(node);
  return node;
}
function drawNode(x, y, text, fill = "#fff", stroke = "#1f3f88") {
  svg.append(svgEl("circle", { cx: x, cy: y, r: 15, fill, stroke, "stroke-width": 2 }));
  label({ x, y: y + 5, "text-anchor": "middle", "font-size": 12, "font-weight": 800, fill: fill === "#fff" ? "#17315f" : "#fff" }, text);
}
function drawLine(a, b, color = "#c7d2e5", width = 1.5) {
  svg.append(svgEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: color, "stroke-width": width }));
}
function draw(n) {
  svg.innerHTML = "";
  const links = n * (n - 1) / 2;
  $("nodesLabel").textContent = n;
  $("links").textContent = links.toLocaleString("es-ES");
  $("perNode").textContent = n - 1;
  $("totalIf").textContent = (n * (n - 1)).toLocaleString("es-ES");

  label({ x: 45, y: 34, fill: "#1f3f88", "font-weight": 900 }, "Malla completa");
  const drawn = Math.min(n, 10);
  const cx = 190, cy = 175, r = 105;
  const pts = Array.from({ length: drawn }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / drawn;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) drawLine(pts[i], pts[j]);
  pts.forEach((p, i) => drawNode(p[0], p[1], String(i + 1), "#1f3f88", "#1f3f88"));
  if (n > 10) label({ x: 60, y: 325, fill: "#516483", "font-size": 13 }, "Dibujo limitado a 10 nodos; los cálculos usan N real.");

  label({ x: 385, y: 34, fill: "#007c89", "font-weight": 900 }, "Estrella");
  const scx = 460, scy = 175, sr = 96;
  drawNode(scx, scy, "S", "#007c89", "#007c89");
  const starN = Math.min(n, 12);
  for (let i = 0; i < starN; i++) {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / starN;
    const p = [scx + Math.cos(a) * sr, scy + Math.sin(a) * sr];
    drawLine([scx, scy], p, "#9fb0cc", 1.6);
    drawNode(p[0], p[1], "", "#fff", "#007c89");
  }
  label({ x: 370, y: 325, fill: "#516483", "font-size": 13 }, "La estrella usa un nodo central; no elimina otros riesgos, pero escala linealmente en enlaces.");

  label({ x: 650, y: 34, fill: "#1f3f88", "font-weight": 900 }, "Crecimiento de enlaces");
  const gx = 645, gy = 325, gw = 210, gh = 230;
  svg.append(svgEl("line", { x1: gx, y1: gy, x2: gx + gw, y2: gy, stroke: "#17315f", "stroke-width": 1.5 }));
  svg.append(svgEl("line", { x1: gx, y1: gy, x2: gx, y2: gy - gh, stroke: "#17315f", "stroke-width": 1.5 }));
  const maxLinks = 100 * 99 / 2;
  const samples = [5, 10, 20, 40, 60, 80, 100];
  let prev = null;
  samples.forEach((s) => {
    const x = gx + (s / 100) * gw;
    const y = gy - ((s * (s - 1) / 2) / maxLinks) * gh;
    if (prev) drawLine(prev, [x, y], "#f59e0b", 3);
    svg.append(svgEl("circle", { cx: x, cy: y, r: s === n ? 5 : 3, fill: s === n ? "#c2413d" : "#f59e0b" }));
    prev = [x, y];
  });
  const nx = gx + (n / 100) * gw;
  const ny = gy - (links / maxLinks) * gh;
  svg.append(svgEl("circle", { cx: nx, cy: ny, r: 7, fill: "#c2413d" }));
  label({ x: gx, y: 360, fill: "#516483", "font-size": 12 }, "N");
  label({ x: gx + 120, y: 360, fill: "#516483", "font-size": 12 }, "crecimiento cuadrático");

  $("interpretation").textContent = `Con N = ${n}, la red necesita ${links.toLocaleString("es-ES")} enlaces. Duplicar nodos no duplica el cableado: lo acelera porque cada nuevo nodo se conecta con todos los anteriores.`;
}
nodesInput.addEventListener("input", () => draw(Number(nodesInput.value)));
draw(Number(nodesInput.value));
