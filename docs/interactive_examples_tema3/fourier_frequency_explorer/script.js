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
  softRed: "#fff0ee"
};

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
if (params.get("embed") === "1") document.body.classList.add("embed");

const state = {
  signalType: "square",
  harmonics: 7,
  fundamental: 2,
  bandwidth: 10,
  showComponents: true,
  showTarget: true
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

function path(points, stroke, width = 2.4, extra = {}) {
  const d = points.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
  return svgEl("path", { d, fill: "none", stroke, "stroke-width": width, "stroke-linejoin": "round", "stroke-linecap": "round", ...extra });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fmt(value, digits = 1) {
  return value.toLocaleString("es-ES", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function targetAt(type, phase) {
  const s = Math.sin(phase);
  if (type === "sine") return s;
  if (type === "square") return s >= 0 ? 1 : -1;
  return (2 / Math.PI) * Math.asin(s);
}

function coefficient(type, n) {
  if (type === "sine") return n === 1 ? 1 : 0;
  if (n % 2 === 0) return 0;
  if (type === "square") return 4 / (Math.PI * n);
  const sign = ((n - 1) / 2) % 2 === 0 ? 1 : -1;
  return sign * (8 / (Math.PI * Math.PI * n * n));
}

function componentList() {
  const items = [];
  for (let n = 1; n <= state.harmonics; n += 1) {
    const amp = coefficient(state.signalType, n);
    if (Math.abs(amp) > 0.0001) {
      const freq = n * state.fundamental;
      items.push({ n, amp, freq, passes: freq <= state.bandwidth + 1e-9 });
    }
  }
  return items;
}

function sumAt(t, onlyPassed) {
  return componentList().reduce((sum, item) => {
    if (onlyPassed && !item.passes) return sum;
    return sum + item.amp * Math.sin(2 * Math.PI * item.freq * t);
  }, 0);
}

function drawAxes(group, box, xLabel, yLabel) {
  group.appendChild(rect(box.x, box.y, box.w, box.h, "#ffffff", COLORS.line, { rx: 10, ry: 10 }));
  for (let i = 1; i < 5; i += 1) {
    const x = box.x + (box.w * i) / 5;
    group.appendChild(line(x, box.y + 30, x, box.y + box.h - 34, COLORS.grid, 1));
  }
  for (let i = 1; i < 4; i += 1) {
    const y = box.y + 30 + ((box.h - 64) * i) / 4;
    group.appendChild(line(box.x + 40, y, box.x + box.w - 18, y, COLORS.grid, 1));
  }
  group.appendChild(line(box.x + 40, box.y + box.h - 34, box.x + box.w - 18, box.y + box.h - 34, COLORS.ink, 1.6));
  group.appendChild(line(box.x + 40, box.y + 28, box.x + 40, box.y + box.h - 34, COLORS.ink, 1.6));
  group.appendChild(text(box.x + box.w - 18, box.y + box.h - 12, xLabel, { anchor: "end", size: 12, fill: COLORS.muted }));
  group.appendChild(text(box.x + 12, box.y + 44, yLabel, { size: 12, fill: COLORS.muted }));
}

function drawWave(group, box, fn, color, width, extra = {}) {
  const plot = {
    x0: box.x + 40,
    y0: box.y + 30,
    w: box.w - 58,
    h: box.h - 64
  };
  const pts = [];
  const samples = 260;
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const x = plot.x0 + t * plot.w;
    const y = plot.y0 + plot.h / 2 - clamp(fn(t), -1.35, 1.35) * (plot.h * 0.34);
    pts.push([x, y]);
  }
  group.appendChild(path(pts, color, width, extra));
}

function drawComponents(root, box, items) {
  const g = svgEl("g");
  drawAxes(g, box, "tiempo", "amplitud");
  g.appendChild(text(box.x + 18, box.y + 20, "Componentes senoidales", { size: 15, weight: 850 }));
  const visible = items.slice(0, 5);
  const rows = Math.max(visible.length, 1);
  const rowH = (box.h - 80) / rows;
  if (!state.showComponents || visible.length === 0) {
    g.appendChild(text(box.x + box.w / 2, box.y + box.h / 2, "Activa componentes para ver los senos", { anchor: "middle", fill: COLORS.muted }));
  }
  visible.forEach((item, index) => {
    const row = {
      x: box.x + 40,
      y: box.y + 42 + rowH * index,
      w: box.w - 58,
      h: rowH - 8
    };
    const center = row.y + row.h / 2;
    g.appendChild(line(row.x, center, row.x + row.w, center, COLORS.grid, 1));
    const pts = [];
    for (let i = 0; i <= 180; i += 1) {
      const t = i / 180;
      const x = row.x + t * row.w;
      const y = center - Math.sin(2 * Math.PI * item.n * t * 2) * row.h * 0.34;
      pts.push([x, y]);
    }
    g.appendChild(path(pts, item.passes ? COLORS.blue : COLORS.red, item.passes ? 2 : 1.5, { opacity: item.passes ? 1 : .38, "stroke-dasharray": item.passes ? "" : "6 7" }));
    g.appendChild(text(row.x + 4, row.y + 11, `n=${item.n} · ${fmt(item.freq, 1)} Hz`, { size: 10, fill: item.passes ? COLORS.ink : COLORS.red, weight: 750 }));
  });
  root.appendChild(g);
}

function drawTemporal(root, box) {
  const g = svgEl("g");
  drawAxes(g, box, "tiempo", "amplitud");
  g.appendChild(text(box.x + 18, box.y + 20, "Suma temporal", { size: 15, weight: 850 }));
  if (state.showTarget) {
    drawWave(g, box, (t) => targetAt(state.signalType, 2 * Math.PI * state.fundamental * t), COLORS.gray, 2, { "stroke-dasharray": "8 7", opacity: .7 });
    g.appendChild(text(box.x + box.w - 25, box.y + 24, "objetivo", { anchor: "end", fill: COLORS.gray, size: 11 }));
  }
  drawWave(g, box, (t) => sumAt(t, true), COLORS.green, 3.1);
  g.appendChild(text(box.x + box.w - 25, box.y + 42, "reconstruida por el canal", { anchor: "end", fill: COLORS.green, size: 11 }));
  root.appendChild(g);
}

function drawSpectrum(root, box, items) {
  const g = svgEl("g");
  drawAxes(g, box, "frecuencia (Hz)", "amplitud");
  g.appendChild(text(box.x + 18, box.y + 20, "Espectro", { size: 15, weight: 850 }));
  const plotX = box.x + 48;
  const plotY = box.y + 42;
  const plotW = box.w - 76;
  const plotH = box.h - 92;
  const maxFreq = Math.max(state.harmonics * state.fundamental, state.bandwidth, 1);
  const winW = clamp((state.bandwidth / maxFreq) * plotW, 0, plotW);
  g.appendChild(rect(plotX, plotY, winW, plotH, "rgba(15, 138, 105, 0.10)", "none", { rx: 0, ry: 0 }));
  g.appendChild(line(plotX + winW, plotY, plotX + winW, plotY + plotH, COLORS.green, 2, { "stroke-dasharray": "7 6" }));
  g.appendChild(text(plotX + Math.min(winW + 5, plotW - 4), plotY + 12, "B", { fill: COLORS.green, size: 12, weight: 900 }));
  const maxAmp = Math.max(1, ...items.map((d) => Math.abs(d.amp)));
  items.forEach((item) => {
    const x = plotX + (item.freq / maxFreq) * plotW;
    const h = (Math.abs(item.amp) / maxAmp) * (plotH - 16);
    const bar = rect(x - 5, plotY + plotH - h, 10, h, item.passes ? COLORS.blue : COLORS.red, "none", { rx: 2, ry: 2, opacity: item.passes ? .92 : .28 });
    g.appendChild(bar);
    if (item.n <= 9) g.appendChild(text(x, plotY + plotH + 14, `${item.n}`, { anchor: "middle", size: 10, fill: COLORS.muted }));
  });
  g.appendChild(text(box.x + box.w - 18, box.y + box.h - 38, "n", { anchor: "end", fill: COLORS.muted, size: 10 }));
  root.appendChild(g);
}

function rmsError() {
  let sum = 0;
  const samples = 180;
  for (let i = 0; i < samples; i += 1) {
    const t = i / samples;
    const diff = targetAt(state.signalType, 2 * Math.PI * state.fundamental * t) - sumAt(t, true);
    sum += diff * diff;
  }
  return Math.sqrt(sum / samples);
}

function updateMessage(items) {
  const passed = items.filter((d) => d.passes).length;
  let message = "La fundamental marca la frecuencia base.";
  let tone = "ok";
  if (state.signalType !== "sine" && state.harmonics >= 5) message = "Los armónicos añaden detalle y aproximan mejor formas con cambios bruscos.";
  if (passed < items.length) {
    message = "Si el canal no deja pasar ciertos armónicos, la señal reconstruida se deforma.";
    tone = passed <= 1 ? "bad" : "warn";
  }
  $("message").textContent = message;
  $("message").dataset.tone = tone;
}

function render() {
  const items = componentList();
  const passed = items.filter((d) => d.passes).length;
  $("harmonicsValue").textContent = String(state.harmonics);
  $("fundamentalValue").textContent = `${fmt(state.fundamental, 1)} Hz`;
  $("bandwidthValue").textContent = `${fmt(state.bandwidth, 1)} Hz`;
  $("periodValue").textContent = `${fmt(1 / state.fundamental, 2)} s`;
  $("passedValue").textContent = `${passed} de ${items.length || 1}`;
  $("errorValue").textContent = fmt(rmsError(), 2);
  updateMessage(items);

  const root = $("fourierSvg");
  root.replaceChildren();
  root.appendChild(svgEl("title", {}, [document.createTextNode("Explorador de frecuencia, Fourier y ancho de banda")]));
  const boxes = [
    { x: 20, y: 24, w: 380, h: 660 },
    { x: 430, y: 24, w: 390, h: 660 },
    { x: 850, y: 24, w: 370, h: 660 }
  ];
  drawComponents(root, boxes[0], items);
  drawTemporal(root, boxes[1]);
  drawSpectrum(root, boxes[2], items);
}

function syncFromControls() {
  state.signalType = $("signalType").value;
  state.harmonics = Number($("harmonics").value);
  state.fundamental = Number($("fundamental").value);
  state.bandwidth = Number($("bandwidth").value);
  state.showComponents = $("showComponents").checked;
  state.showTarget = $("showTarget").checked;
  render();
}

function applyPreset(name) {
  const presets = {
    "square-rich": { signalType: "square", harmonics: 9, fundamental: 2, bandwidth: 18 },
    "square-narrow": { signalType: "square", harmonics: 11, fundamental: 2, bandwidth: 3.5 },
    "sine-basic": { signalType: "sine", harmonics: 1, fundamental: 1.5, bandwidth: 4 },
    triangle: { signalType: "triangle", harmonics: 9, fundamental: 2, bandwidth: 10 }
  };
  Object.assign(state, presets[name]);
  $("signalType").value = state.signalType;
  $("harmonics").value = String(state.harmonics);
  $("fundamental").value = String(state.fundamental);
  $("bandwidth").value = String(state.bandwidth);
  render();
}

["signalType", "harmonics", "fundamental", "bandwidth", "showComponents", "showTarget"].forEach((id) => {
  $(id).addEventListener("input", syncFromControls);
});

$("preset").addEventListener("change", (event) => applyPreset(event.target.value));
$("resetBtn").addEventListener("click", () => {
  $("preset").value = "square-rich";
  $("showComponents").checked = true;
  $("showTarget").checked = true;
  applyPreset("square-rich");
});

$("challengeBtn").addEventListener("click", () => {
  const items = componentList();
  const lost = items.filter((d) => !d.passes).map((d) => `n=${d.n}`);
  const ok = state.signalType === "square" && lost.length >= 2;
  $("challengeFeedback").textContent = ok
    ? `Bien: han quedado fuera ${lost.join(", ")}. La forma pierde bordes porque faltan armónicos altos.`
    : "Prueba con señal cuadrada y reduce el ancho de banda hasta dejar fuera varios armónicos.";
  $("challengeFeedback").dataset.tone = ok ? "ok" : "warn";
});

render();
