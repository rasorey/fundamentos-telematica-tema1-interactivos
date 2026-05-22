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
  softBlue: "#eaf2fb",
  softGreen: "#e6f5f0",
  softRed: "#fff0ee",
  softYellow: "#fff7cf"
};

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
if (params.get("embed") === "1") document.body.classList.add("embed");

const state = {
  bits: "10110010",
  noise: 0.22,
  attenuation: 0,
  threshold: 0,
  separation: 2,
  regenerator: true
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

function path(points) {
  return points.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
}

function sanitizeBits(value) {
  const clean = value.replace(/[^01]/g, "").slice(0, 16);
  return clean || "0";
}

function noiseValue(i, bit) {
  const s1 = Math.sin((i + 1) * 2.19) * 0.57;
  const s2 = Math.cos((i + 2) * 1.31) * 0.33;
  const polarity = bit === "1" ? -0.18 : 0.18;
  return state.noise * (s1 + s2 + polarity);
}

function model() {
  const bits = state.bits.split("");
  const high = state.separation / 2;
  const low = -state.separation / 2;
  const scale = 1 - state.attenuation / 100;
  const samples = bits.map((bit, i) => {
    const original = bit === "1" ? high : low;
    const received = original * scale + noiseValue(i, bit);
    const decided = received >= state.threshold ? "1" : "0";
    return { bit, original, received, decided, error: bit !== decided };
  });
  const errors = samples.filter((s) => s.error).length;
  const margins = samples.map((s) => Math.abs(s.received - state.threshold));
  return {
    bits,
    samples,
    errors,
    ber: errors / bits.length,
    minMargin: Math.min(...margins)
  };
}

function xForBit(i, x0, bitW) {
  return x0 + i * bitW + bitW / 2;
}

function yForValue(value, yMid, ampPx) {
  const clamped = Math.max(-1.35, Math.min(1.35, value));
  return yMid - clamped * ampPx;
}

function stepPoints(values, x0, yMid, bitW, ampPx) {
  const pts = [];
  values.forEach((value, i) => {
    const y = yForValue(value, yMid, ampPx);
    const xs = x0 + i * bitW;
    const xe = x0 + (i + 1) * bitW;
    if (i === 0) pts.push([xs, y]);
    else pts.push([xs, pts[pts.length - 1][1]], [xs, y]);
    pts.push([xe, y]);
  });
  return pts;
}

function drawGrid(root, x, y, w, h, columns = 8) {
  root.appendChild(line(x, y + h, x + w, y + h, COLORS.muted, 1.4));
  root.appendChild(line(x, y, x, y + h, COLORS.muted, 1.4));
  for (let i = 1; i < columns; i += 1) {
    const xx = x + (w * i) / columns;
    root.appendChild(line(xx, y, xx, y + h, COLORS.grid, 1));
  }
  for (let j = 1; j < 4; j += 1) {
    const yy = y + (h * j) / 4;
    root.appendChild(line(x, yy, x + w, yy, COLORS.grid, 1));
  }
  root.appendChild(text(x, y - 16, "amplitud", { size: 12, fill: COLORS.muted }));
  root.appendChild(text(x + w, y + h + 18, "tiempo", { size: 12, fill: COLORS.muted, anchor: "end" }));
}

function drawBits(root, bits, decided, x0, y, bitW) {
  bits.forEach((bit, i) => {
    const fill = decided && bit !== decided[i] ? COLORS.softRed : "#fff";
    root.appendChild(rect(x0 + i * bitW + 3, y, bitW - 6, 30, fill, COLORS.line, { rx: 4, ry: 4 }));
    root.appendChild(text(x0 + i * bitW + bitW / 2, y + 16, bit, { anchor: "middle", size: 14, weight: 900, fill: bit !== (decided ? decided[i] : bit) ? COLORS.red : COLORS.ink }));
  });
}

function drawWave(root, label, yTop, values, color, x0, width, bitW, withGrid = true) {
  const yMid = yTop + 66;
  const h = 100;
  if (withGrid) drawGrid(root, x0, yTop, width, h, values.length);
  root.appendChild(text(x0 - 26, yMid, label, { anchor: "end", size: 16, weight: 900, fill: color }));
  root.appendChild(svgEl("path", { d: path(stepPoints(values, x0, yMid, bitW, 42)), fill: "none", stroke: color, "stroke-width": 3, "stroke-linejoin": "round" }));
}

function drawReceived(root, data, x0, yTop, width, bitW) {
  const yMid = yTop + 72;
  const h = 112;
  drawGrid(root, x0, yTop, width, h, data.bits.length);
  const thresholdY = yForValue(state.threshold, yMid, 42);
  root.appendChild(line(x0, thresholdY, x0 + width, thresholdY, COLORS.muted, 2, { "stroke-dasharray": "10 8" }));
  root.appendChild(text(x0 + width + 10, thresholdY, "umbral", { size: 12, fill: COLORS.muted }));
  const receivedValues = data.samples.map((s) => s.received);
  root.appendChild(text(x0 - 26, yMid, "Recibida", { anchor: "end", size: 16, weight: 900, fill: COLORS.orange }));
  root.appendChild(svgEl("path", { d: path(stepPoints(receivedValues, x0, yMid, bitW, 42)), fill: "none", stroke: COLORS.orange, "stroke-width": 3, "stroke-linejoin": "round" }));
  data.samples.forEach((s, i) => {
    const cx = xForBit(i, x0, bitW);
    const cy = yForValue(s.received, yMid, 42);
    root.appendChild(circle(cx, cy, s.error ? 7 : 5, s.error ? COLORS.red : COLORS.green));
    if (s.error) root.appendChild(text(cx, cy - 18, "error", { size: 11, fill: COLORS.red, anchor: "middle", weight: 900 }));
  });
}

function drawDecision(root, data, x0, y, bitW) {
  root.appendChild(text(x0 - 26, y + 16, "Decididos", { anchor: "end", size: 15, weight: 900, fill: COLORS.ink }));
  drawBits(root, data.bits, data.samples.map((s) => s.decided), x0, y, bitW);
}

function drawSummary(root, data) {
  const x = 920;
  root.appendChild(rect(x, 96, 245, 110, data.errors ? COLORS.softRed : COLORS.softGreen, data.errors ? COLORS.red : COLORS.green, { "stroke-width": 1.5 }));
  root.appendChild(text(x + 20, 126, data.errors ? "Hay error" : "Sin error", { size: 19, weight: 900, fill: data.errors ? COLORS.red : COLORS.green }));
  root.appendChild(text(x + 20, 160, `BER = ${(100 * data.ber).toFixed(1)} %`, { size: 18, weight: 900 }));
  root.appendChild(text(x + 20, 187, `${data.errors} de ${data.bits.length} bits`, { size: 13, fill: COLORS.muted }));
  root.appendChild(rect(x, 232, 245, 118, COLORS.softYellow, COLORS.line));
  root.appendChild(text(x + 20, 262, "Lectura", { size: 17, weight: 900 }));
  const message = data.errors
    ? "Si el ruido cruza el umbral, el error se regenera como bit equivocado."
    : "El regenerador decide y reconstruye una forma limpia.";
  root.appendChild(wrappedText(x + 20, 294, message, 205, 15, COLORS.text));
  root.appendChild(rect(x, 382, 245, 95, COLORS.softBlue, COLORS.line));
  root.appendChild(text(x + 20, 412, "Margen", { size: 17, weight: 900 }));
  root.appendChild(wrappedText(x + 20, 444, "Mas separacion entre niveles aumenta el margen frente al ruido.", 205, 15, COLORS.text));
}

function wrappedText(x, y, content, maxWidth, size, fill) {
  const group = svgEl("g");
  const words = content.split(" ");
  let lineText = "";
  let lineNo = 0;
  words.forEach((word) => {
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

function draw() {
  const svg = $("regenSvg");
  const data = model();
  svg.replaceChildren();
  svg.appendChild(rect(18, 18, 1204, 684, "#fff", COLORS.line, { rx: 12, ry: 12 }));
  const x0 = 160;
  const width = 720;
  const bitW = width / data.bits.length;
  drawBits(svg, data.bits, null, x0, 48, bitW);
  drawWave(svg, "Original", 104, data.samples.map((s) => s.original), COLORS.blue, x0, width, bitW);
  drawReceived(svg, data, x0, 250, width, bitW);
  drawDecision(svg, data, x0, 430, bitW);
  const regenValues = state.regenerator ? data.samples.map((s) => s.decided === "1" ? state.separation / 2 : -state.separation / 2) : data.samples.map((s) => s.received);
  drawWave(svg, state.regenerator ? "Regenerada" : "Sin regenerar", 498, regenValues, state.regenerator ? COLORS.green : COLORS.orange, x0, width, bitW, true);
  drawSummary(svg, data);
  updateMetrics(data);
}

function updateMetrics(data) {
  $("noiseValue").textContent = `${state.noise.toFixed(2)} V`;
  $("attenuationValue").textContent = `${state.attenuation} %`;
  $("thresholdValue").textContent = `${state.threshold.toFixed(2)} V`;
  $("separationValue").textContent = `${state.separation.toFixed(1)} V`;
  $("berValue").textContent = `${(100 * data.ber).toFixed(1)} %`;
  $("errorsValue").textContent = `${data.errors}/${data.bits.length}`;
  $("marginValue").textContent = `${data.minMargin.toFixed(2)} V`;
  const message = $("message");
  if (data.errors > 0) {
    message.dataset.tone = "bad";
    message.textContent = "Si el ruido cruza el umbral, el error se regenera como bit equivocado.";
  } else if (state.separation < 1.2 || state.attenuation > 35 || state.noise > 0.45) {
    message.dataset.tone = "warn";
    message.textContent = "El margen es estrecho: una pequena perturbacion puede cambiar la decision.";
  } else {
    message.dataset.tone = "ok";
    message.textContent = "El regenerador no conserva la forma ruidosa: decide y reconstruye.";
  }
}

function syncFromControls() {
  state.bits = sanitizeBits($("bitsInput").value);
  $("bitsInput").value = state.bits;
  state.noise = Number($("noise").value);
  state.attenuation = Number($("attenuation").value);
  state.threshold = Number($("threshold").value);
  state.separation = Number($("separation").value);
  state.regenerator = $("regenerator").checked;
  draw();
}

function applyPreset(name) {
  const presets = {
    clean: { bits: "10110010", noise: 0.18, attenuation: 8, threshold: 0, separation: 2, regenerator: true },
    error: { bits: "10110010", noise: 0.62, attenuation: 55, threshold: 0.2, separation: 0.8, regenerator: true },
    wide: { bits: "11001010", noise: 0.28, attenuation: 5, threshold: 0, separation: 2.4, regenerator: true },
    narrow: { bits: "10101010", noise: 0.34, attenuation: 30, threshold: 0, separation: 1, regenerator: true }
  };
  Object.assign(state, presets[name]);
  $("bitsInput").value = state.bits;
  $("noise").value = state.noise;
  $("attenuation").value = state.attenuation;
  $("threshold").value = state.threshold;
  $("separation").value = state.separation;
  $("regenerator").checked = state.regenerator;
  draw();
}

function challenge() {
  const data = model();
  const feedback = $("challengeFeedback");
  if (!data.errors) {
    feedback.dataset.tone = "warn";
    feedback.textContent = "Todavia no hay errores. Sube el ruido o reduce la separacion entre niveles.";
    return;
  }
  const first = data.samples.findIndex((s) => s.error) + 1;
  feedback.dataset.tone = "bad";
  feedback.textContent = `El primer error aparece en la muestra ${first}: cruza el umbral y se decide como ${data.samples[first - 1].decided}.`;
}

["bitsInput", "noise", "attenuation", "threshold", "separation", "regenerator"].forEach((id) => {
  $(id).addEventListener("input", syncFromControls);
});

$("preset").addEventListener("change", (event) => applyPreset(event.target.value));
$("resetBtn").addEventListener("click", () => {
  $("preset").value = "clean";
  applyPreset("clean");
});
$("challengeBtn").addEventListener("click", challenge);

applyPreset("clean");
