/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse ../../../LICENSE-0BSD, ../../../LICENSE-CC0 y ../../../LICENSES.md.
 */
export const colors = {
  app: "#6b4bbe",
  appSoft: "#f0ecfa",
  transport: "#d96b00",
  transportSoft: "#fff0e3",
  internet: "#1e5aa8",
  internetSoft: "#eaf3fb",
  link: "#00846b",
  linkSoft: "#e5f4ef",
  physical: "#6b7280",
  physicalSoft: "#f1f3f5",
  payload: "#f6f7f9",
  line: "#b8c8e4",
  ink: "#17366f",
  muted: "#607399",
  gold: "#ffcc00",
  ok: "#13795b",
  warn: "#b45309",
  bad: "#b42318"
};

export function initLabPage() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("embed") === "1") document.body.classList.add("embed");
}

export function $(id) {
  return document.getElementById(id);
}

export function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function svg(tag, attrs = {}, children = []) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) el.setAttribute(key, String(value));
  });
  children.forEach((child) => el.appendChild(child));
  return el;
}

export function line(x1, y1, x2, y2, stroke = colors.line, width = 2, extra = {}) {
  return svg("line", { x1, y1, x2, y2, stroke, "stroke-width": width, ...extra });
}

export function rect(x, y, width, height, fill, stroke = colors.line, extra = {}) {
  return svg("rect", { x, y, width, height, fill, stroke, rx: 6, ry: 6, ...extra });
}

export function text(x, y, content, attrs = {}) {
  const {
    size = 14,
    weight = 650,
    anchor = "start",
    baseline = "middle",
    fill = colors.ink,
    ...extra
  } = attrs;
  const el = svg("text", {
    x,
    y,
    fill,
    "font-size": size,
    "font-weight": weight,
    "text-anchor": anchor,
    "dominant-baseline": baseline,
    ...extra
  });
  el.textContent = content;
  return el;
}

export function arrow(x1, y1, x2, y2, stroke = colors.ink, width = 2, dashed = false) {
  const markerId = `arrow-${Math.random().toString(16).slice(2)}`;
  const marker = svg("marker", {
    id: markerId,
    viewBox: "0 0 10 10",
    refX: 8,
    refY: 5,
    markerWidth: 6,
    markerHeight: 6,
    orient: "auto-start-reverse"
  }, [svg("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: stroke })]);
  const defs = svg("defs", {}, [marker]);
  const ln = line(x1, y1, x2, y2, stroke, width, {
    "marker-end": `url(#${markerId})`,
    ...(dashed ? { "stroke-dasharray": "8 7" } : {})
  });
  return svg("g", {}, [defs, ln]);
}

export function fmtBytes(bytes) {
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function pct(value) {
  return `${(value * 100).toFixed(1)} %`;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function randomEphemeral() {
  return Math.floor(49152 + Math.random() * (65535 - 49152));
}

export function setStatus(id, message, tone = "info") {
  const el = $(id);
  if (!el) return;
  el.textContent = message;
  el.dataset.tone = tone;
  el.style.borderLeftColor = tone === "ok" ? colors.ok : tone === "bad" ? colors.bad : tone === "warn" ? colors.warn : colors.gold;
}
