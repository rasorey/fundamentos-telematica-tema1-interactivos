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
const svg = $("meshSvg");
const nodesInput = $("nodes");
const presets = { "8": 8, "20": 20, "50": 50, "100": 100 };

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
function syncPreset(n) {
  const match = Object.keys(presets).find((key) => presets[key] === n);
  if ($("preset")) $("preset").value = match || "8";
}
function explain(n, links) {
  const ratio = n > 1 ? links / n : 0;
  const warning = n >= 50
    ? " Aviso: para N alto, cableado, puertos, coste y mantenimiento crecen de forma poco realista."
    : "";
  return `Con N = ${n}, la red necesita ${links.toLocaleString("es-ES")} enlaces, unas ${ratio.toFixed(1)} conexiones por nodo de media vistas desde el total de enlaces. Duplicar nodos no duplica el cableado: lo acelera porque cada nuevo nodo se conecta con todos los anteriores.${warning}`;
}
function drawSwitched(n) {
  label({ x: 392, y: 372, fill: "#5969b3", "font-weight": 900 }, "Red conmutada");
  const cx = 505, cy = 385;
  [["A", 430, 350], ["B", 585, 350], ["C", 430, 410], ["D", 585, 410]].forEach(([name, x, y]) => {
    drawLine([cx, cy], [x, y], "#9fb0cc", 1.7);
    drawNode(x, y, name, "#fff", "#5969b3");
  });
  drawNode(cx, cy, "T", "#5969b3", "#5969b3");
  label({ x: 365, y: 455, fill: "#516483", "font-size": 12 }, `Introduce tránsito: menos enlaces físicos directos que una malla de ${n} nodos.`);
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
  label({ x: 370, y: 315, fill: "#516483", "font-size": 13 }, "La estrella escala linealmente en enlaces, pero concentra dependencia en el centro.");
  drawSwitched(n);

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

  $("interpretation").textContent = explain(n, links);
}
function setNodes(n) {
  nodesInput.value = n;
  syncPreset(n);
  draw(Number(nodesInput.value));
}
nodesInput.addEventListener("input", () => draw(Number(nodesInput.value)));
$("preset").addEventListener("change", () => setNodes(presets[$("preset").value]));
$("resetBtn").addEventListener("click", () => setNodes(8));
$("explainBtn").addEventListener("click", () => {
  const n = Number(nodesInput.value);
  const links = n * (n - 1) / 2;
  $("interpretation").textContent = explain(n, links) + " Una red conmutada evita crear un enlace físico para cada pareja y concentra decisiones de encaminamiento en nodos de red.";
});
draw(Number(nodesInput.value));
