/*
 * Codigo fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Veanse ../../../LICENSE-0BSD, ../../../LICENSE-CC0 y ../../../LICENSES.md.
 */
const COLORS = {
  ink: "#17315f",
  muted: "#60728f",
  line: "#c4d0e4",
  grid: "#e5ebf5",
  blue: "#1e5aa8",
  green: "#0f8a69",
  orange: "#d96b00",
  red: "#b42318",
  yellow: "#ffcc00",
  gray: "#697386",
  softBlue: "#eaf2fb",
  softGreen: "#e6f5f0",
  softOrange: "#fff0e0",
  softRed: "#fff0ee"
};

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
if (params.get("embed") === "1") document.body.classList.add("embed");

const state = {
  bandwidthKHz: 3,
  levels: 4,
  snrDb: 24,
  targetKbps: 8
};

function svgEl(tag, attrs = {}, children = []) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) el.setAttribute(key, String(value));
  });
  children.forEach((child) => el.appendChild(child));
  return el;
}

function line(x1, y1, x2, y2, stroke = COLORS.line, width = 1.5, extra = {}) {
  return svgEl("line", { x1, y1, x2, y2, stroke, "stroke-width": width, ...extra });
}

function rect(x, y, width, height, fill, stroke = COLORS.line, extra = {}) {
  return svgEl("rect", { x, y, width, height, fill, stroke, rx: 8, ry: 8, ...extra });
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

function fmt(value, digits = 1) {
  return value.toLocaleString("es-ES", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function fmtRate(bitsPerSecond) {
  if (bitsPerSecond >= 1_000_000) return `${fmt(bitsPerSecond / 1_000_000, 2)} Mbit/s`;
  return `${fmt(bitsPerSecond / 1_000, 1)} kbit/s`;
}

function compute() {
  const b = state.bandwidthKHz * 1000;
  const snLinear = 10 ** (state.snrDb / 10);
  const nyquist = 2 * b * Math.log2(state.levels);
  const shannon = b * Math.log2(1 + snLinear);
  const target = state.targetKbps * 1000;
  const limiting = Math.min(nyquist, shannon);
  return { b, snLinear, nyquist, shannon, target, limiting };
}

function viability(values) {
  if (values.target > values.shannon + 1e-9) return { tone: "bad", label: "Supera Shannon", message: "Shannon limita la capacidad cuando hay ruido." };
  if (values.target > values.nyquist + 1e-9) return { tone: "bad", label: "Supera Nyquist", message: "Nyquist ideal no permite esa tasa con el B y M actuales." };
  if (values.target > values.limiting * 0.82) return { tone: "warn", label: "Cerca del límite", message: "La tasa objetivo está cerca del límite: queda poco margen de diseño." };
  return { tone: "ok", label: "Viable", message: "La tasa objetivo queda por debajo de ambos límites." };
}

function drawBar(root, x, y, w, h, label, value, max, color) {
  root.appendChild(text(x, y - 14, label, { size: 14, weight: 850 }));
  root.appendChild(rect(x, y, w, h, "#eef3fb", COLORS.line, { rx: 7, ry: 7 }));
  const fillW = Math.max(4, Math.min(w, (value / max) * w));
  root.appendChild(rect(x, y, fillW, h, color, "none", { rx: 7, ry: 7 }));
  root.appendChild(text(x + w - 8, y + h / 2, fmtRate(value), { anchor: "end", fill: "#fff", size: 13, weight: 900 }));
}

function drawBars(root, values) {
  const box = { x: 32, y: 34, w: 700, h: 298 };
  root.appendChild(rect(box.x, box.y, box.w, box.h, "#fff", COLORS.line));
  root.appendChild(text(box.x + 18, box.y + 22, "Comparación de límites", { size: 18, weight: 900 }));
  const max = Math.max(values.nyquist, values.shannon, values.target) * 1.12;
  drawBar(root, box.x + 28, box.y + 88, box.w - 72, 40, "Nyquist ideal: Rb,max = 2 B log2(M)", values.nyquist, max, COLORS.blue);
  drawBar(root, box.x + 28, box.y + 172, box.w - 72, 40, "Shannon con ruido: C = B log2(1 + S/N)", values.shannon, max, COLORS.green);
  drawBar(root, box.x + 28, box.y + 256, box.w - 72, 40, "Tasa objetivo", values.target, max, COLORS.orange);
}

function drawLevels(root) {
  const box = { x: 764, y: 34, w: 382, h: 298 };
  root.appendChild(rect(box.x, box.y, box.w, box.h, "#fff", COLORS.line));
  root.appendChild(text(box.x + 18, box.y + 22, `Separación entre ${state.levels} niveles`, { size: 18, weight: 900 }));
  const x0 = box.x + 70;
  const x1 = box.x + box.w - 28;
  const top = box.y + 56;
  const bottom = box.y + box.h - 36;
  const levels = state.levels;
  for (let i = 0; i < levels; i += 1) {
    const y = levels === 1 ? (top + bottom) / 2 : bottom - (i / (levels - 1)) * (bottom - top);
    const opacity = levels > 32 ? .42 : levels > 16 ? .58 : .88;
    root.appendChild(line(x0, y, x1, y, COLORS.blue, levels > 32 ? 1 : 1.4, { opacity }));
    if (levels <= 16 || i % Math.ceil(levels / 16) === 0) {
      root.appendChild(text(x0 - 12, y, `${i}`, { anchor: "end", size: 10, fill: COLORS.muted }));
    }
  }
  const spacing = 2 / Math.max(1, levels - 1);
  root.appendChild(text(box.x + 18, box.y + box.h - 16, `Más M: distancia normalizada ≈ ${fmt(spacing, 3)}`, { size: 12, fill: COLORS.muted }));
}

function drawConversion(root, values) {
  const box = { x: 32, y: 370, w: 480, h: 292 };
  root.appendChild(rect(box.x, box.y, box.w, box.h, "#fff", COLORS.line));
  root.appendChild(text(box.x + 18, box.y + 24, "Conversión de SNR", { size: 18, weight: 900 }));
  root.appendChild(text(box.x + 26, box.y + 70, `SNR_dB = ${fmt(state.snrDb, 0)} dB`, { size: 18, fill: COLORS.blue, weight: 900 }));
  root.appendChild(text(box.x + 26, box.y + 112, `S/N = 10^(${fmt(state.snrDb, 0)} / 10) = ${fmt(values.snLinear, 2)}`, { size: 17, fill: COLORS.ink, weight: 850 }));
  root.appendChild(text(box.x + 26, box.y + 172, "No uses dB directamente en Shannon.", { size: 15, fill: COLORS.red, weight: 900 }));
  root.appendChild(text(box.x + 26, box.y + 206, "La fórmula necesita relación lineal de potencias.", { size: 13, fill: COLORS.muted }));
}

function drawDecision(root, values, v) {
  const box = { x: 542, y: 370, w: 604, h: 292 };
  root.appendChild(rect(box.x, box.y, box.w, box.h, v.tone === "ok" ? COLORS.softGreen : v.tone === "warn" ? COLORS.softOrange : COLORS.softRed, v.tone === "ok" ? COLORS.green : v.tone === "warn" ? COLORS.orange : COLORS.red, { "stroke-width": 2 }));
  root.appendChild(text(box.x + 24, box.y + 34, v.label, { size: 24, weight: 950, fill: v.tone === "ok" ? COLORS.green : v.tone === "warn" ? COLORS.orange : COLORS.red }));
  root.appendChild(text(box.x + 24, box.y + 78, v.message, { size: 17, weight: 800 }));
  root.appendChild(text(box.x + 24, box.y + 124, `B = ${fmt(state.bandwidthKHz, 1)} kHz · M = ${state.levels} · SNR = ${fmt(state.snrDb, 0)} dB`, { size: 15, fill: COLORS.ink }));
  root.appendChild(text(box.x + 24, box.y + 160, `Límite efectivo para la tasa objetivo: ${fmtRate(values.limiting)}`, { size: 15, fill: COLORS.ink, weight: 850 }));
}

function render() {
  const values = compute();
  const v = viability(values);
  $("bandwidthLabel").textContent = `${fmt(state.bandwidthKHz, 1)} kHz`;
  $("snrLabel").textContent = `${fmt(state.snrDb, 0)} dB`;
  $("targetLabel").textContent = fmtRate(values.target);
  $("snrLinearValue").textContent = fmt(values.snLinear, 2);
  $("nyquistValue").textContent = fmtRate(values.nyquist);
  $("shannonValue").textContent = fmtRate(values.shannon);
  $("status").textContent = v.tone === "ok"
    ? "Nyquist y Shannon permiten la tasa objetivo en este escenario."
    : v.message;
  $("status").dataset.tone = v.tone;

  const root = $("capacitySvg");
  root.replaceChildren();
  root.appendChild(svgEl("title", {}, [document.createTextNode("Comparación de Nyquist, Shannon y tasa objetivo")]));
  drawBars(root, values);
  drawLevels(root);
  drawConversion(root, values);
  drawDecision(root, values, v);
}

function syncFromControls() {
  state.bandwidthKHz = Number($("bandwidth").value);
  state.levels = Number($("levels").value);
  state.snrDb = Number($("snr").value);
  state.targetKbps = Number($("target").value);
  render();
}

function applyPreset(name) {
  const presets = {
    "clean-narrow": { bandwidthKHz: 3, levels: 4, snrDb: 24, targetKbps: 8 },
    "wide-noisy": { bandwidthKHz: 1200, levels: 8, snrDb: 8, targetKbps: 5600 },
    "many-levels-low-snr": { bandwidthKHz: 20, levels: 64, snrDb: 5, targetKbps: 200 },
    "impossible-shannon": { bandwidthKHz: 3, levels: 64, snrDb: 8, targetKbps: 55 },
    "nyquist-limited": { bandwidthKHz: 5, levels: 2, snrDb: 38, targetKbps: 14 }
  };
  Object.assign(state, presets[name]);
  $("bandwidth").value = String(state.bandwidthKHz);
  $("levels").value = String(state.levels);
  $("snr").value = String(state.snrDb);
  $("target").value = String(state.targetKbps);
  render();
}

["bandwidth", "levels", "snr", "target"].forEach((id) => {
  $(id).addEventListener("input", syncFromControls);
});

$("preset").addEventListener("change", (event) => applyPreset(event.target.value));
$("resetBtn").addEventListener("click", () => {
  $("preset").value = "clean-narrow";
  applyPreset("clean-narrow");
});

$("challengeBtn").addEventListener("click", () => {
  const values = compute();
  const nyquistAllows = values.target <= values.nyquist;
  const shannonAllows = values.target <= values.shannon;
  const ok = nyquistAllows && !shannonAllows;
  $("challengeFeedback").textContent = ok
    ? "Buen caso: Nyquist ideal permitiría la tasa, pero Shannon la rechaza al bajar SNR."
    : "Busca un caso donde Nyquist permita la tasa y Shannon deje de permitirla al reducir SNR.";
  $("challengeFeedback").dataset.tone = ok ? "ok" : "warn";
});

render();
