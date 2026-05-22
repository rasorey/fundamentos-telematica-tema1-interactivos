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
  softBlue: "#eaf2fb"
};

const CODE_LABELS = {
  nrzl: "NRZ-L",
  nrzi: "NRZI",
  ami: "Bipolar-AMI",
  pseudo: "Pseudoternario",
  manchester: "Manchester",
  b8zs: "B8ZS",
  hdb3: "HDB3"
};

const CODE_MESSAGES = {
  nrzl: "NRZ-L: el nivel representa directamente el bit.",
  nrzi: "NRZI: el 1 provoca transición; el 0 mantiene el nivel.",
  ami: "AMI alterna polaridad para los unos; los ceros quedan a 0.",
  pseudo: "Pseudoternario alterna polaridad para los ceros; los unos quedan a 0.",
  manchester: "Manchester introduce una transición central en cada bit.",
  b8zs: "B8ZS sustituye ocho ceros por violaciones reconocibles.",
  hdb3: "HDB3 sustituye ceros largos para mantener sincronismo y balance."
};

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
if (params.get("embed") === "1") document.body.classList.add("embed");

const state = {
  bits: "100000000001",
  mainCode: "ami",
  initialPolarity: 1,
  showGrid: true,
  showTransitions: true,
  showViolations: true,
  showClock: true,
  showDc: true
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
  return svgEl("rect", { x, y, width, height, fill, stroke, rx: 6, ry: 6, ...extra });
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

function pathFromSegments(segments, x0, yMid, bitW, amp) {
  const points = [];
  segments.forEach((segment, index) => {
    const xStart = x0 + segment.start * bitW;
    const xEnd = x0 + segment.end * bitW;
    const y = yMid - segment.level * amp;
    if (index === 0) points.push([xStart, y]);
    else points.push([xStart, points[points.length - 1][1]], [xStart, y]);
    points.push([xEnd, y]);
  });
  return points.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
}

function sanitizeBits(value) {
  const clean = value.replace(/[^01]/g, "").slice(0, 16);
  return clean || "0";
}

function normalPulse(last) {
  return -last;
}

function encodeBasic(code, bits) {
  const segments = [];
  let level = code === "nrzi" ? -1 : 0;
  let lastPulse = -state.initialPolarity;
  bits.split("").forEach((bit, i) => {
    if (code === "nrzl") {
      segments.push({ start: i, end: i + 1, level: bit === "1" ? 1 : -1 });
    } else if (code === "nrzi") {
      if (bit === "1") level *= -1;
      segments.push({ start: i, end: i + 1, level });
    } else if (code === "ami") {
      if (bit === "1") {
        lastPulse = normalPulse(lastPulse);
        segments.push({ start: i, end: i + 1, level: lastPulse, mark: "B" });
      } else {
        segments.push({ start: i, end: i + 1, level: 0 });
      }
    } else if (code === "pseudo") {
      if (bit === "0") {
        lastPulse = normalPulse(lastPulse);
        segments.push({ start: i, end: i + 1, level: lastPulse, mark: "B" });
      } else {
        segments.push({ start: i, end: i + 1, level: 0 });
      }
    } else if (code === "manchester") {
      const first = bit === "1" ? -1 : 1;
      const second = -first;
      segments.push({ start: i, end: i + 0.5, level: first });
      segments.push({ start: i + 0.5, end: i + 1, level: second, centerTransition: true });
    }
  });
  return segments;
}

function encodeB8zs(bits) {
  const segments = [];
  let i = 0;
  let lastPulse = -state.initialPolarity;
  while (i < bits.length) {
    if (bits.slice(i, i + 8) === "00000000") {
      const p = lastPulse === 0 ? state.initialPolarity : lastPulse;
      const pattern = [0, 0, 0, p, -p, 0, -p, p];
      const marks = ["", "", "", "V", "B", "", "V", "B"];
      pattern.forEach((level, j) => segments.push({ start: i + j, end: i + j + 1, level, mark: marks[j] }));
      lastPulse = p;
      i += 8;
    } else {
      const bit = bits[i];
      if (bit === "1") {
        lastPulse = normalPulse(lastPulse);
        segments.push({ start: i, end: i + 1, level: lastPulse, mark: "B" });
      } else {
        segments.push({ start: i, end: i + 1, level: 0 });
      }
      i += 1;
    }
  }
  return segments;
}

function encodeHdb3(bits) {
  const segments = [];
  let i = 0;
  let lastPulse = -state.initialPolarity;
  let pulsesSinceViolation = 0;
  while (i < bits.length) {
    if (bits.slice(i, i + 4) === "0000") {
      if (pulsesSinceViolation % 2 === 0) {
        const b = normalPulse(lastPulse);
        const pattern = [b, 0, 0, b];
        const marks = ["B", "", "", "V"];
        pattern.forEach((level, j) => segments.push({ start: i + j, end: i + j + 1, level, mark: marks[j] }));
        lastPulse = b;
      } else {
        const v = lastPulse;
        const pattern = [0, 0, 0, v];
        const marks = ["", "", "", "V"];
        pattern.forEach((level, j) => segments.push({ start: i + j, end: i + j + 1, level, mark: marks[j] }));
      }
      pulsesSinceViolation = 0;
      i += 4;
    } else {
      const bit = bits[i];
      if (bit === "1") {
        lastPulse = normalPulse(lastPulse);
        pulsesSinceViolation += 1;
        segments.push({ start: i, end: i + 1, level: lastPulse, mark: "B" });
      } else {
        segments.push({ start: i, end: i + 1, level: 0 });
      }
      i += 1;
    }
  }
  return segments;
}

function encode(code, bits) {
  if (code === "b8zs") return encodeB8zs(bits);
  if (code === "hdb3") return encodeHdb3(bits);
  return encodeBasic(code, bits);
}

function selectedCodes() {
  if (document.body.classList.contains("embed") && state.bits.includes("00000000") && state.mainCode === "ami") {
    return ["ami", "b8zs", "hdb3"];
  }
  const checks = [...document.querySelectorAll(".compare-code:checked")].map((input) => input.value);
  const list = [state.mainCode, ...checks.filter((code) => code !== state.mainCode)];
  const unique = [...new Set(list)];
  return document.body.classList.contains("embed") ? unique.slice(0, 3) : unique.slice(0, 5);
}

function transitionCount(segments) {
  let count = 0;
  for (let i = 1; i < segments.length; i += 1) {
    if (segments[i].level !== segments[i - 1].level) count += 1;
  }
  return count;
}

function dcDescription(segments) {
  const total = segments.reduce((sum, s) => sum + s.level * (s.end - s.start), 0);
  const duration = segments.reduce((sum, s) => sum + (s.end - s.start), 0);
  const avg = total / Math.max(1, duration);
  if (Math.abs(avg) < 0.08) return "DC ≈ 0";
  return avg > 0 ? "DC positiva" : "DC negativa";
}

function longestFlatRun(segments) {
  let best = 0;
  let current = 0;
  let previous = null;
  segments.forEach((segment) => {
    const length = segment.end - segment.start;
    if (previous !== null && segment.level === previous) current += length;
    else current = length;
    previous = segment.level;
    best = Math.max(best, current);
  });
  return best;
}

function drawBitHeader(root, bits, x0, y, bitW) {
  root.appendChild(text(x0 - 50, y + 18, "bits", { anchor: "end", size: 13, fill: COLORS.muted }));
  bits.split("").forEach((bit, i) => {
    root.appendChild(rect(x0 + i * bitW + 3, y, bitW - 6, 34, bit === "1" ? COLORS.softBlue : "#fff", COLORS.line, { rx: 4, ry: 4 }));
    root.appendChild(text(x0 + i * bitW + bitW / 2, y + 18, bit, { anchor: "middle", size: 15, weight: 900, fill: COLORS.ink }));
  });
}

function drawClock(root, bits, x0, y, bitW, width) {
  if (!state.showClock) return;
  const yClock = y - 18;
  root.appendChild(text(x0 - 50, yClock, "reloj", { anchor: "end", size: 11, fill: COLORS.muted }));
  for (let i = 0; i <= bits.length; i += 1) {
    root.appendChild(line(x0 + i * bitW, yClock - 7, x0 + i * bitW, yClock + 7, COLORS.gray, 1.2));
  }
  root.appendChild(line(x0, yClock, x0 + width, yClock, COLORS.gray, 1.2, { "stroke-dasharray": "4 5" }));
}

function drawRow(root, code, bits, y, rowH, x0, bitW) {
  const width = bitW * bits.length;
  const segments = encode(code, bits);
  const yMid = y + rowH / 2 + 8;
  const amp = Math.min(28, rowH * 0.27);
  root.appendChild(text(x0 - 22, yMid - 18, CODE_LABELS[code], { anchor: "end", size: 14, weight: 900 }));
  root.appendChild(text(x0 - 22, yMid + 5, `${transitionCount(segments)} trans.`, { anchor: "end", size: 10, fill: COLORS.muted }));
  if (state.showDc) root.appendChild(text(x0 - 22, yMid + 22, dcDescription(segments), { anchor: "end", size: 10, fill: COLORS.muted }));
  root.appendChild(line(x0, yMid - amp, x0 + width, yMid - amp, COLORS.grid, 1));
  root.appendChild(line(x0, yMid, x0 + width, yMid, COLORS.grid, 1.2));
  root.appendChild(line(x0, yMid + amp, x0 + width, yMid + amp, COLORS.grid, 1));
  root.appendChild(text(x0 + width + 10, yMid - amp, "+V", { size: 10, fill: COLORS.muted }));
  root.appendChild(text(x0 + width + 10, yMid, "0", { size: 10, fill: COLORS.muted }));
  root.appendChild(text(x0 + width + 10, yMid + amp, "-V", { size: 10, fill: COLORS.muted }));

  if (state.showGrid) {
    for (let i = 0; i <= bits.length; i += 1) {
      root.appendChild(line(x0 + i * bitW, y + 4, x0 + i * bitW, y + rowH - 4, COLORS.grid, 1));
    }
  }

  const d = pathFromSegments(segments, x0, yMid, bitW, amp);
  root.appendChild(svgEl("path", { d, fill: "none", stroke: code === state.mainCode ? COLORS.blue : COLORS.green, "stroke-width": code === state.mainCode ? 3.4 : 2.4, "stroke-linejoin": "round", "stroke-linecap": "round" }));

  if (state.showTransitions) {
    for (let i = 1; i < segments.length; i += 1) {
      if (segments[i].level !== segments[i - 1].level) {
        const x = x0 + segments[i].start * bitW;
        root.appendChild(line(x, yMid - amp - 12, x, yMid + amp + 12, COLORS.orange, 1.7, { opacity: .8 }));
      }
    }
  }

  if (state.showViolations) {
    segments.forEach((segment) => {
      if (segment.mark === "V" || segment.mark === "B") {
        const x = x0 + (segment.start + segment.end) * bitW / 2;
        const yMark = yMid - segment.level * amp - (segment.level >= 0 ? 17 : -17);
        const color = segment.mark === "V" ? COLORS.red : COLORS.blue;
        root.appendChild(svgEl("circle", { cx: x, cy: yMark, r: 10, fill: segment.mark === "V" ? "#fff0ee" : "#eaf2fb", stroke: color, "stroke-width": 1.6 }));
        root.appendChild(text(x, yMark + 1, segment.mark, { anchor: "middle", size: 10, fill: color, weight: 900 }));
      }
    });
  }

  return { segments, transitions: transitionCount(segments), flat: longestFlatRun(segments) };
}

function render() {
  const bits = state.bits;
  const root = $("codingSvg");
  root.replaceChildren();
  root.appendChild(svgEl("title", {}, [document.createTextNode("Comparador de codigos de linea")]));
  const x0 = 160;
  const maxWidth = 930;
  const bitW = Math.min(68, maxWidth / bits.length);
  const waveW = bitW * bits.length;
  const codes = selectedCodes();
  const headerY = 28;
  drawBitHeader(root, bits, x0, headerY, bitW);
  drawClock(root, bits, x0, headerY + 58, bitW, waveW);
  const rowTop = 104;
  const rowH = Math.min(132, (620 - rowTop) / Math.max(1, codes.length));
  const stats = [];
  codes.forEach((code, index) => {
    stats.push({ code, ...drawRow(root, code, bits, rowTop + index * rowH, rowH, x0, bitW) });
  });
  const longNoTransition = stats.filter((s) => s.flat >= 4).map((s) => CODE_LABELS[s.code]);
  const advancedVisible = codes.some((code) => code === "b8zs" || code === "hdb3");
  root.appendChild(rect(22, 650, 1170, 46, "#ffffff", COLORS.line));
  const info = longNoTransition.length
    ? `Rachas largas sin transiciones en: ${longNoTransition.join(", ")}. B8ZS/HDB3 corrigen ceros largos con sustituciones.`
    : "Las transiciones ayudan a recuperar el reloj; compara la misma secuencia en varios codigos.";
  root.appendChild(text(42, 674, advancedVisible ? "Las marcas V son violaciones reconocibles; B conserva el balance bipolar." : info, { size: 14, weight: 800, fill: advancedVisible ? COLORS.red : COLORS.ink }));

  $("status").textContent = CODE_MESSAGES[state.mainCode];
  $("status").dataset.tone = ["b8zs", "hdb3"].includes(state.mainCode) ? "warn" : "ok";
}

function syncFromControls() {
  state.bits = sanitizeBits($("bitsInput").value);
  $("bitsInput").value = state.bits;
  state.mainCode = $("mainCode").value;
  state.initialPolarity = Number($("initialPolarity").value);
  state.showGrid = $("showGrid").checked;
  state.showTransitions = $("showTransitions").checked;
  state.showViolations = $("showViolations").checked;
  state.showClock = $("showClock").checked;
  render();
}

function ensureMainCompared() {
  const main = state.mainCode;
  const check = [...document.querySelectorAll(".compare-code")].find((item) => item.value === main);
  if (check) check.checked = true;
}

$("bitsInput").addEventListener("input", syncFromControls);
$("preset").addEventListener("change", (event) => {
  state.bits = event.target.value;
  $("bitsInput").value = state.bits;
  render();
});
$("mainCode").addEventListener("change", (event) => {
  state.mainCode = event.target.value;
  ensureMainCompared();
  render();
});
$("initialPolarity").addEventListener("change", syncFromControls);
["showGrid", "showTransitions", "showViolations", "showClock", "showDc"].forEach((id) => $(id).addEventListener("change", syncFromControls));
document.querySelectorAll(".compare-code").forEach((input) => input.addEventListener("change", render));

$("resetBtn").addEventListener("click", () => {
  state.bits = "100000000001";
  state.mainCode = "ami";
  state.initialPolarity = 1;
  $("bitsInput").value = state.bits;
  $("preset").value = state.bits;
  $("mainCode").value = state.mainCode;
  $("initialPolarity").value = "1";
  ["showGrid", "showTransitions", "showViolations", "showClock", "showDc"].forEach((id) => { $(id).checked = true; });
  document.querySelectorAll(".compare-code").forEach((input) => { input.checked = ["nrzl", "ami", "manchester"].includes(input.value); });
  render();
});

$("challengeBtn").addEventListener("click", () => {
  const bits = state.bits;
  const selected = selectedCodes();
  const hasZeros = bits === "00000000";
  const hasAdvanced = selected.includes("b8zs") || selected.includes("hdb3");
  $("challengeFeedback").textContent = hasZeros && hasAdvanced
    ? "Correcto: compara NRZ/AMI, que pueden quedar sin transiciones, con B8ZS/HDB3, que introducen marcas reconocibles."
    : "Usa la secuencia 00000000 y activa B8ZS o HDB3 junto a algun codigo basico.";
  $("challengeFeedback").dataset.tone = hasZeros && hasAdvanced ? "ok" : "warn";
});

ensureMainCompared();
render();
