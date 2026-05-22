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
  signalFreq: 3,
  sampleFreq: 12,
  bits: 3,
  range: 1,
  showHold: true,
  showQuant: true,
  showWords: true
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

function circle(cx, cy, r, fill, stroke = "#fff", width = 2) {
  return svgEl("circle", { cx, cy, r, fill, stroke, "stroke-width": width });
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

function signal(t) {
  return 0.82 * state.range * Math.sin(2 * Math.PI * state.signalFreq * t);
}

function quantize(value) {
  const levels = 2 ** state.bits;
  const clipped = Math.max(-state.range, Math.min(state.range, value));
  const index = Math.round(((clipped + state.range) / (2 * state.range)) * (levels - 1));
  const quantized = -state.range + (index * 2 * state.range) / (levels - 1);
  return { index, quantized };
}

function binary(index) {
  return index.toString(2).padStart(state.bits, "0");
}

function samples() {
  const count = Math.max(3, Math.min(28, Math.round(state.sampleFreq)));
  return Array.from({ length: count }, (_, n) => {
    const t = n / count;
    const value = signal(t);
    const q = quantize(value);
    return { t, value, index: q.index, quantized: q.quantized, word: binary(q.index) };
  });
}

function xScale(t, x, w) {
  return x + t * w;
}

function yScale(v, y, h) {
  const norm = (v + state.range) / (2 * state.range);
  return y + h - norm * h;
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
  root.appendChild(text(x + w, y + h + 18, "tiempo", { size: 12, fill: COLORS.muted, anchor: "end" }));
}

function drawAnalogAndSamples(root, data, x, y, w, h) {
  drawGrid(root, x, y, w, h);
  root.appendChild(text(x, y - 34, "1. Muestreo", { size: 17, weight: 900, fill: COLORS.blue }));
  const pts = Array.from({ length: 360 }, (_, i) => {
    const t = i / 359;
    return [xScale(t, x, w), yScale(signal(t), y, h)];
  });
  root.appendChild(svgEl("path", { d: path(pts), fill: "none", stroke: COLORS.blue, "stroke-width": 3 }));
  data.forEach((s) => root.appendChild(circle(xScale(s.t, x, w), yScale(s.value, y, h), 6, COLORS.green)));
}

function drawHold(root, data, x, y, w, h) {
  drawGrid(root, x, y, w, h);
  root.appendChild(text(x, y - 34, "2. Sample & hold", { size: 17, weight: 900, fill: COLORS.green }));
  const analog = Array.from({ length: 220 }, (_, i) => {
    const t = i / 219;
    return [xScale(t, x, w), yScale(signal(t), y, h)];
  });
  root.appendChild(svgEl("path", { d: path(analog), fill: "none", stroke: COLORS.blue, "stroke-width": 2, "stroke-dasharray": "5 5", opacity: 0.65 }));
  if (!state.showHold) return;
  const pts = [];
  data.forEach((s, i) => {
    const nextT = data[i + 1] ? data[i + 1].t : 1;
    const yv = yScale(s.value, y, h);
    const xs = xScale(s.t, x, w);
    const xe = xScale(nextT, x, w);
    if (i === 0) pts.push([xs, yv]);
    else pts.push([xs, pts[pts.length - 1][1]], [xs, yv]);
    pts.push([xe, yv]);
    root.appendChild(circle(xs, yv, 4, COLORS.green));
  });
  root.appendChild(svgEl("path", { d: path(pts), fill: "none", stroke: COLORS.green, "stroke-width": 3 }));
}

function drawQuantization(root, data, x, y, w, h) {
  drawGrid(root, x, y, w, h, 8, Math.min(8, 2 ** state.bits));
  root.appendChild(text(x, y - 34, "3. Cuantificacion", { size: 17, weight: 900, fill: COLORS.orange }));
  const levels = 2 ** state.bits;
  for (let i = 0; i < levels; i += 1) {
    const v = -state.range + (i * 2 * state.range) / (levels - 1);
    root.appendChild(line(x, yScale(v, y, h), x + w, yScale(v, y, h), COLORS.line, 1, { opacity: 0.75 }));
  }
  if (!state.showQuant) return;
  data.forEach((s) => {
    const xs = xScale(s.t, x, w);
    const yReal = yScale(s.value, y, h);
    const yQ = yScale(s.quantized, y, h);
    root.appendChild(line(xs, yReal, xs, yQ, COLORS.red, 2));
    root.appendChild(circle(xs, yReal, 5, COLORS.orange));
    root.appendChild(circle(xs, yQ, 5, COLORS.green));
  });
  root.appendChild(text(x + w - 10, y + 18, "error", { size: 12, fill: COLORS.red, anchor: "end" }));
}

function drawWords(root, data, x, y, w, h) {
  root.appendChild(rect(x, y, w, h, "#fff", COLORS.line, { rx: 10, ry: 10 }));
  root.appendChild(text(x + 20, y + 32, "4. Palabras binarias", { size: 17, weight: 900, fill: COLORS.violet }));
  const visible = data.slice(0, Math.min(data.length, 6));
  const colW = (w - 52) / 3;
  visible.forEach((s, i) => {
    const bx = x + 20 + (i % 3) * colW + 2;
    const by = y + 58 + Math.floor(i / 3) * 52;
    root.appendChild(rect(bx, by, colW - 8, 30, COLORS.softBlue, COLORS.line, { rx: 4, ry: 4 }));
    root.appendChild(text(bx + (colW - 8) / 2, by + 16, s.word, { size: 13, weight: 900, anchor: "middle", fill: COLORS.ink }));
    root.appendChild(text(bx + (colW - 8) / 2, by + 41, `n${i}`, { size: 10.5, weight: 700, anchor: "middle", fill: COLORS.muted }));
  });
  if (!state.showWords) {
    root.appendChild(rect(x + 20, y + 58, w - 40, 72, "#fff", COLORS.line));
    root.appendChild(text(x + w / 2, y + 94, "Palabras ocultas", { size: 16, fill: COLORS.muted, anchor: "middle" }));
  }
}

function drawStatus(root, data) {
  const alias = state.sampleFreq <= 2 * state.signalFreq;
  const x = 805;
  root.appendChild(rect(x, 64, 330, 105, alias ? COLORS.softRed : COLORS.softGreen, alias ? COLORS.red : COLORS.green, { "stroke-width": 1.5 }));
  root.appendChild(text(x + 20, 94, alias ? "Aliasing posible" : "Muestreo suficiente", { size: 19, weight: 900, fill: alias ? COLORS.red : COLORS.green }));
  root.appendChild(wrappedText(x + 20, 128, alias ? "fs no supera 2·fmax: una frecuencia alta puede parecer mas baja." : "fs supera 2·fmax para esta senal senoidal.", 285, 15, COLORS.text));
  root.appendChild(rect(x, 192, 330, 115, COLORS.softYellow, COLORS.line));
  root.appendChild(text(x + 20, 224, "Idea clave", { size: 18, weight: 900 }));
  root.appendChild(wrappedText(x + 20, 258, "Muestrear no es cuantificar. Sample & hold mantiene la muestra; PCM anade niveles y palabras binarias.", 285, 15, COLORS.text));
  root.appendChild(rect(x, 330, 330, 95, COLORS.softBlue, COLORS.line));
  root.appendChild(text(x + 20, 360, "Error medio", { size: 18, weight: 900 }));
  root.appendChild(text(x + 20, 394, `${rmsError(data).toFixed(3)} V`, { size: 22, weight: 900, fill: COLORS.blue }));
}

function rmsError(data) {
  const sum = data.reduce((acc, s) => acc + (s.value - s.quantized) ** 2, 0);
  return Math.sqrt(sum / data.length);
}

function draw() {
  const svg = $("pcmSvg");
  const data = samples();
  svg.replaceChildren();
  svg.appendChild(rect(18, 18, 1204, 684, "#fff", COLORS.line, { rx: 12, ry: 12 }));
  drawAnalogAndSamples(svg, data, 80, 94, 660, 138);
  drawHold(svg, data, 80, 312, 660, 120);
  drawQuantization(svg, data, 80, 522, 660, 120);
  drawWords(svg, data, 805, 455, 330, 162);
  drawStatus(svg, data);
  updateText(data);
}

function updateText(data) {
  const alias = state.sampleFreq <= 2 * state.signalFreq;
  $("signalFreqValue").textContent = `${state.signalFreq.toFixed(1)} Hz`;
  $("sampleFreqValue").textContent = `${state.sampleFreq} Hz`;
  $("bitsValue").textContent = String(state.bits);
  $("rangeValue").textContent = `±${state.range.toFixed(1)} V`;
  $("nyquistValue").textContent = `${(2 * state.signalFreq).toFixed(1)} Hz`;
  $("levelsValue").textContent = String(2 ** state.bits);
  $("errorValue").textContent = `${rmsError(data).toFixed(3)} V`;
  const message = $("message");
  if (alias) {
    message.dataset.tone = "bad";
    message.textContent = "Si fs no supera 2·fmax, puede aparecer aliasing.";
  } else if (state.bits <= 2) {
    message.dataset.tone = "warn";
    message.textContent = "La cuantificacion redondea a pocos niveles y crea error propio.";
  } else {
    message.dataset.tone = "ok";
    message.textContent = "Muestrear no es cuantificar: PCM/MIC encadena muestreo, cuantificacion y codificacion.";
  }
}

function syncFromControls() {
  state.signalFreq = Number($("signalFreq").value);
  state.sampleFreq = Number($("sampleFreq").value);
  state.bits = Number($("bits").value);
  state.range = Number($("range").value);
  state.showHold = $("showHold").checked;
  state.showQuant = $("showQuant").checked;
  state.showWords = $("showWords").checked;
  draw();
}

function reset() {
  Object.assign(state, { signalFreq: 3, sampleFreq: 12, bits: 3, range: 1, showHold: true, showQuant: true, showWords: true });
  $("signalFreq").value = state.signalFreq;
  $("sampleFreq").value = state.sampleFreq;
  $("bits").value = state.bits;
  $("range").value = state.range;
  $("showHold").checked = state.showHold;
  $("showQuant").checked = state.showQuant;
  $("showWords").checked = state.showWords;
  draw();
}

function challenge() {
  const feedback = $("challengeFeedback");
  if (state.sampleFreq <= 2 * state.signalFreq) {
    feedback.dataset.tone = "bad";
    feedback.textContent = "Ya aparece aliasing: la senal reconstruida puede sugerir una frecuencia mas baja que la original.";
  } else {
    feedback.dataset.tone = "warn";
    feedback.textContent = "Aun no hay aliasing. Baja fs hasta que sea menor o igual que 2·fmax.";
  }
}

["signalFreq", "sampleFreq", "bits", "range", "showHold", "showQuant", "showWords"].forEach((id) => {
  $(id).addEventListener("input", syncFromControls);
});
$("resetBtn").addEventListener("click", reset);
$("challengeBtn").addEventListener("click", challenge);

reset();
