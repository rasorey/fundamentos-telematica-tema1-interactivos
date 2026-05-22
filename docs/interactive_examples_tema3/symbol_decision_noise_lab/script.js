/*
 * Codigo fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Veanse ../../../LICENSE-0BSD, ../../../LICENSE-CC0 y ../../../LICENSES.md.
 */
const COLORS = {
  ink: "#17315f",
  text: "#283f63",
  muted: "#60728f",
  line: "#c4d0e4",
  grid: "#e5ebf5",
  blue: "#1e5aa8",
  green: "#0f8a69",
  orange: "#d96b00",
  red: "#b42318",
  yellow: "#ffcc00",
  violet: "#6356b3",
  softBlue: "#eaf2fb",
  softGreen: "#e6f5f0",
  softRed: "#fff0ee",
  softYellow: "#fff7cf"
};

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
if (params.get("embed") === "1") document.body.classList.add("embed");

const state = {
  levels: 4,
  noise: 0.16,
  attenuation: 10,
  distortion: 0.1,
  interference: 0.08,
  symbolCount: 64,
  compare: true,
  seed: 7
};

function svgEl(tag, attrs = {}, children = []) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) el.setAttribute(key, String(value));
  });
  children.forEach((child) => el.appendChild(child));
  return el;
}

function line(x1, y1, x2, y2, stroke = COLORS.line, width = 1.4, extra = {}) {
  return svgEl("line", { x1, y1, x2, y2, stroke, "stroke-width": width, ...extra });
}

function rect(x, y, width, height, fill, stroke = COLORS.line, extra = {}) {
  return svgEl("rect", { x, y, width, height, fill, stroke, rx: 6, ry: 6, ...extra });
}

function circle(cx, cy, r, fill, stroke = "#fff", width = 2, extra = {}) {
  return svgEl("circle", { cx, cy, r, fill, stroke, "stroke-width": width, ...extra });
}

function text(x, y, content, attrs = {}) {
  const el = svgEl("text", {
    x,
    y,
    fill: attrs.fill || COLORS.ink,
    "font-size": attrs.size || 14,
    "font-weight": attrs.weight || 700,
    "text-anchor": attrs.anchor || "start",
    "dominant-baseline": attrs.baseline || "middle"
  });
  el.textContent = content;
  return el;
}

function wrappedText(x, y, content, maxWidth, size, fill) {
  const group = svgEl("g");
  let lineText = "";
  let lineNo = 0;
  content.split(" ").forEach((word) => {
    const test = lineText ? `${lineText} ${word}` : word;
    if (test.length * size * 0.52 > maxWidth && lineText) {
      group.appendChild(text(x, y + lineNo * (size + 5), lineText, { size, fill, weight: 600 }));
      lineText = word;
      lineNo += 1;
    } else {
      lineText = test;
    }
  });
  if (lineText) group.appendChild(text(x, y + lineNo * (size + 5), lineText, { size, fill, weight: 600 }));
  return group;
}

function rand(seed) {
  let x = Math.sin(seed * 999.31) * 10000;
  return x - Math.floor(x);
}

function randn(i) {
  const u1 = Math.max(0.001, rand(state.seed + i * 2 + 1));
  const u2 = rand(state.seed + i * 2 + 2);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function levelValue(index) {
  if (state.levels === 1) return 0;
  return -1 + (2 * index) / (state.levels - 1);
}

function nearestLevel(value) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < state.levels; i += 1) {
    const d = Math.abs(value - levelValue(i));
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

function bitWord(index) {
  return index.toString(2).padStart(Math.log2(state.levels), "0");
}

function bitErrors(a, b) {
  const aw = bitWord(a);
  const bw = bitWord(b);
  let errors = 0;
  for (let i = 0; i < aw.length; i += 1) if (aw[i] !== bw[i]) errors += 1;
  return errors;
}

function generateData() {
  const attenuation = 1 - state.attenuation / 100;
  const symbols = [];
  for (let i = 0; i < state.symbolCount; i += 1) {
    const idealIndex = Math.floor(rand(state.seed + i * 13.7) * state.levels);
    const ideal = levelValue(idealIndex);
    const noise = state.noise * randn(i);
    const distortion = state.distortion * (ideal ** 3 - ideal) * 0.8;
    const interference = state.interference * Math.sin(2 * Math.PI * (i / 9.5 + 0.12));
    const received = ideal * attenuation + noise + distortion + interference;
    const decidedIndex = nearestLevel(received);
    symbols.push({
      i,
      idealIndex,
      ideal,
      received,
      decidedIndex,
      error: idealIndex !== decidedIndex,
      bitErrors: bitErrors(idealIndex, decidedIndex)
    });
  }
  const symbolErrors = symbols.filter((s) => s.error).length;
  const bitsPerSymbol = Math.log2(state.levels);
  const totalBitErrors = symbols.reduce((sum, s) => sum + s.bitErrors, 0);
  return {
    symbols,
    symbolErrors,
    ber: totalBitErrors / (symbols.length * bitsPerSymbol),
    ser: symbolErrors / symbols.length,
    spacing: 2 / (state.levels - 1)
  };
}

function xScale(i, count, x, w) {
  return x + (i / Math.max(1, count - 1)) * w;
}

function yScale(v, y, h) {
  const clamped = Math.max(-1.4, Math.min(1.4, v));
  return y + h - ((clamped + 1.4) / 2.8) * h;
}

function path(points) {
  return points.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
}

function drawGrid(root, x, y, w, h, columns = 8, rows = 4) {
  root.appendChild(line(x, y + h, x + w, y + h, COLORS.muted, 1.4));
  root.appendChild(line(x, y, x, y + h, COLORS.muted, 1.4));
  for (let i = 1; i < columns; i += 1) root.appendChild(line(x + i * w / columns, y, x + i * w / columns, y + h, COLORS.grid, 1));
  for (let j = 1; j < rows; j += 1) root.appendChild(line(x, y + j * h / rows, x + w, y + j * h / rows, COLORS.grid, 1));
  root.appendChild(text(x, y - 15, "amplitud", { size: 12, fill: COLORS.muted }));
  root.appendChild(text(x + w, y + h + 18, "simbolo", { size: 12, fill: COLORS.muted, anchor: "end" }));
}

function drawTimePanel(root, data, x, y, w, h) {
  drawGrid(root, x, y, w, h, 8, 4);
  root.appendChild(text(x, y - 34, "Señal ideal y perturbada", { size: 17, weight: 900, fill: COLORS.blue }));
  const shown = data.symbols.slice(0, Math.min(data.symbols.length, 64));
  const idealPts = shown.map((s, i) => [xScale(i, shown.length, x, w), yScale(s.ideal, y, h)]);
  const recvPts = shown.map((s, i) => [xScale(i, shown.length, x, w), yScale(s.received, y, h)]);
  if (state.compare) root.appendChild(svgEl("path", { d: path(idealPts), fill: "none", stroke: COLORS.blue, "stroke-width": 2.5, "stroke-dasharray": "7 5" }));
  root.appendChild(svgEl("path", { d: path(recvPts), fill: "none", stroke: COLORS.orange, "stroke-width": 3 }));
  shown.forEach((s, i) => {
    if (!s.error && i % 2) return;
    root.appendChild(circle(xScale(i, shown.length, x, w), yScale(s.received, y, h), s.error ? 6 : 3.5, s.error ? COLORS.red : COLORS.green, "#fff", 1.5));
  });
  root.appendChild(text(x + w - 112, y + 18, "perturbada", { size: 12, fill: COLORS.orange }));
  if (state.compare) root.appendChild(text(x + w - 112, y + 38, "ideal", { size: 12, fill: COLORS.blue }));
}

function drawDecisionRegions(root, data, x, y, w, h) {
  root.appendChild(rect(x, y, w, h, "#fff", COLORS.line, { rx: 10, ry: 10 }));
  root.appendChild(text(x + 18, y + 30, "Regiones de decision", { size: 17, weight: 900, fill: COLORS.ink }));
  for (let i = 0; i < state.levels; i += 1) {
    const level = levelValue(i);
    const yy = yScale(level, y + 55, h - 85);
    root.appendChild(line(x + 55, yy, x + w - 35, yy, COLORS.line, 1.2));
    root.appendChild(text(x + 20, yy, String(i), { size: 11, fill: COLORS.muted }));
  }
  for (let i = 0; i < state.levels - 1; i += 1) {
    const boundary = (levelValue(i) + levelValue(i + 1)) / 2;
    const yy = yScale(boundary, y + 55, h - 85);
    root.appendChild(line(x + 55, yy, x + w - 35, yy, COLORS.muted, 1.4, { "stroke-dasharray": "6 6" }));
  }
  const counts = Array.from({ length: state.levels }, () => ({ ok: 0, bad: 0 }));
  data.symbols.forEach((s) => counts[s.decidedIndex][s.error ? "bad" : "ok"] += 1);
  const max = Math.max(1, ...counts.map((c) => c.ok + c.bad));
  counts.forEach((c, i) => {
    const level = levelValue(i);
    const yy = yScale(level, y + 55, h - 85);
    const okW = (c.ok / max) * 105;
    const badW = (c.bad / max) * 105;
    root.appendChild(rect(x + 95, yy - 8, okW, 9, COLORS.green, COLORS.green, { rx: 2, ry: 2 }));
    root.appendChild(rect(x + 95 + okW, yy - 8, badW, 9, COLORS.red, COLORS.red, { rx: 2, ry: 2 }));
  });
}

function drawCloud(root, data, x, y, w, h) {
  root.appendChild(rect(x, y, w, h, "#fff", COLORS.line, { rx: 10, ry: 10 }));
  root.appendChild(text(x + 18, y + 30, "Nube de decision", { size: 17, weight: 900, fill: COLORS.ink }));
  const px = x + 55;
  const py = y + 70;
  const pw = w - 90;
  const ph = h - 105;
  root.appendChild(line(px, py + ph, px + pw, py + ph, COLORS.muted, 1.3));
  root.appendChild(line(px, py, px, py + ph, COLORS.muted, 1.3));
  for (let i = 0; i < state.levels; i += 1) {
    const xx = px + (i / Math.max(1, state.levels - 1)) * pw;
    root.appendChild(line(xx, py, xx, py + ph, COLORS.grid, 1));
    root.appendChild(text(xx, py + ph + 18, String(i), { size: 11, anchor: "middle", fill: COLORS.muted }));
  }
  data.symbols.forEach((s, idx) => {
    const xx = px + (s.idealIndex / Math.max(1, state.levels - 1)) * pw + (rand(state.seed + idx * 4.1) - 0.5) * Math.min(26, pw / state.levels);
    const yy = yScale(s.received, py, ph);
    root.appendChild(circle(xx, yy, s.error ? 4.4 : 3.2, s.error ? COLORS.red : COLORS.green, "#fff", 1, { opacity: s.error ? 0.95 : 0.72 }));
  });
  root.appendChild(text(px + pw, py - 16, "muestras recibidas", { size: 12, fill: COLORS.muted, anchor: "end" }));
}

function drawSummary(root, data) {
  const x = 830;
  root.appendChild(rect(x, 86, 325, 104, data.symbolErrors ? COLORS.softRed : COLORS.softGreen, data.symbolErrors ? COLORS.red : COLORS.green, { "stroke-width": 1.5 }));
  root.appendChild(text(x + 20, 116, data.symbolErrors ? "Errores presentes" : "Sin errores", { size: 19, weight: 900, fill: data.symbolErrors ? COLORS.red : COLORS.green }));
  root.appendChild(text(x + 20, 150, `BER ≈ ${(100 * data.ber).toFixed(1)} %`, { size: 20, weight: 900 }));
  root.appendChild(text(x + 20, 176, `${data.symbolErrors}/${data.symbols.length} simbolos`, { size: 13, fill: COLORS.muted }));
  const cards = [
    ["Atenuacion", "Reduce margen.", COLORS.orange],
    ["Ruido", "Añade variacion aleatoria.", COLORS.red],
    ["Distorsion", "Deforma la señal.", COLORS.violet],
    ["Interferencia", "Añade una señal no deseada.", COLORS.green]
  ];
  cards.forEach((card, i) => {
    const yy = 220 + i * 74;
    root.appendChild(rect(x, yy, 325, 56, "#fff", COLORS.line));
    root.appendChild(rect(x, yy, 6, 56, card[2], card[2]));
    root.appendChild(text(x + 18, yy + 20, card[0], { size: 15, weight: 900, fill: card[2] }));
    root.appendChild(text(x + 130, yy + 20, card[1], { size: 13.5, weight: 700, fill: COLORS.text }));
  });
}

function draw() {
  const svg = $("decisionSvg");
  const data = generateData();
  svg.replaceChildren();
  svg.appendChild(rect(18, 18, 1204, 684, "#fff", COLORS.line, { rx: 12, ry: 12 }));
  drawTimePanel(svg, data, 70, 92, 705, 170);
  drawDecisionRegions(svg, data, 70, 330, 340, 265);
  drawCloud(svg, data, 435, 330, 340, 265);
  drawSummary(svg, data);
  updateText(data);
}

function updateText(data) {
  $("levelsValue").textContent = String(state.levels);
  $("noiseValue").textContent = `${state.noise.toFixed(2)} V`;
  $("attenuationValue").textContent = `${state.attenuation} %`;
  $("distortionValue").textContent = state.distortion.toFixed(2);
  $("interferenceValue").textContent = `${state.interference.toFixed(2)} V`;
  $("symbolCountValue").textContent = String(state.symbolCount);
  $("berValue").textContent = `${(100 * data.ber).toFixed(1)} %`;
  $("serValue").textContent = `${data.symbolErrors}/${data.symbols.length}`;
  $("marginValue").textContent = `${data.spacing.toFixed(2)} V`;
  const message = $("message");
  if (data.symbolErrors > 0) {
    message.dataset.tone = "bad";
    message.textContent = "El error aparece cuando una muestra cae en la region de decision equivocada.";
  } else if (data.spacing < 0.32 || state.attenuation > 30) {
    message.dataset.tone = "warn";
    message.textContent = "El margen se estrecha: mas niveles o mas atenuacion acercan la decision al error.";
  } else {
    message.dataset.tone = "ok";
    message.textContent = "Las muestras permanecen dentro de su region de decision.";
  }
}

function syncFromControls() {
  state.levels = Number($("levels").value);
  state.noise = Number($("noise").value);
  state.attenuation = Number($("attenuation").value);
  state.distortion = Number($("distortion").value);
  state.interference = Number($("interference").value);
  state.symbolCount = Number($("symbolCount").value);
  state.compare = $("compare").checked;
  draw();
}

function challenge() {
  const feedback = $("challengeFeedback");
  if (state.levels < 8) {
    feedback.dataset.tone = "warn";
    feedback.textContent = "Sube a 8 o 16 niveles con el mismo ruido: las regiones se estrechan y la BER suele subir.";
  } else {
    const data = generateData();
    feedback.dataset.tone = data.symbolErrors ? "bad" : "ok";
    feedback.textContent = data.symbolErrors
      ? `Con ${state.levels} niveles aparecen ${data.symbolErrors} simbolos erroneos: hay menos margen entre niveles.`
      : "Aun no hay errores, pero observa que la separacion ideal entre niveles ya es menor.";
  }
}

["levels", "noise", "attenuation", "distortion", "interference", "symbolCount", "compare"].forEach((id) => {
  $(id).addEventListener("input", syncFromControls);
});

$("generateBtn").addEventListener("click", () => {
  state.seed += 17;
  draw();
});
$("challengeBtn").addEventListener("click", challenge);

draw();
