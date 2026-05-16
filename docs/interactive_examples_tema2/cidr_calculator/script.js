/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse ../../../LICENSE-0BSD, ../../../LICENSE-CC0 y ../../../LICENSES.md.
 */
import { $, clear, colors, initLabPage, rect, setStatus, setText, svg, text } from "../shared/lab-utils.js";

initLabPage();

const presets = {
  lan: ["192.168.1.0", 24, "LAN privada"],
  privateA: ["10.0.0.0", 8, "Privada grande"],
  privateB: ["172.16.0.0", 12, "Privada intermedia"],
  doc: ["203.0.113.0", 27, "Ejemplo documental"],
  classA: ["10.0.0.0", 8, "Clase A histórica: tamaño similar a /8"],
  classB: ["172.16.0.0", 16, "Clase B histórica: tamaño similar a /16"],
  classC: ["192.168.1.0", 24, "Clase C histórica: tamaño similar a /24"]
};

const MAX32 = (1n << 32n) - 1n;

function parseIp(ip) {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) throw new Error("La IPv4 debe tener cuatro octetos.");
  return parts.reduce((acc, part) => {
    if (!/^\d+$/.test(part)) throw new Error("Cada octeto debe ser numérico.");
    const n = Number(part);
    if (n < 0 || n > 255) throw new Error("Cada octeto debe estar entre 0 y 255.");
    return (acc << 8n) + BigInt(n);
  }, 0n);
}

function ipToString(num) {
  return [24n, 16n, 8n, 0n].map((shift) => Number((num >> shift) & 255n)).join(".");
}

function maskFromPrefix(prefix) {
  return prefix === 0 ? 0n : (MAX32 << BigInt(32 - prefix)) & MAX32;
}

function calculate() {
  const prefix = Number($("prefixInput").value);
  const ip = parseIp($("ipInput").value);
  const mask = maskFromPrefix(prefix);
  const network = ip & mask;
  const broadcast = network | (MAX32 ^ mask);
  const total = 1n << BigInt(32 - prefix);
  const usable = total > 2n ? total - 2n : total;
  return { prefix, ip, mask, network, broadcast, total, usable };
}

function renderBits(root, prefix) {
  const x = 90;
  const y = 172;
  const w = 740;
  const h = 56;
  const netW = Math.max(2, (prefix / 32) * w);
  root.appendChild(rect(x, y, netW, h, colors.internet, colors.internet, { rx: 3, ry: 3 }));
  root.appendChild(rect(x + netW, y, w - netW, h, colors.payload, colors.line, { rx: 3, ry: 3 }));
  root.appendChild(text(x + netW / 2, y + 28, `red: ${prefix} bits`, { anchor: "middle", fill: "#fff", size: 14, weight: 850 }));
  root.appendChild(text(x + netW + (w - netW) / 2, y + 28, `host: ${32 - prefix} bits`, { anchor: "middle", fill: colors.ink, size: 14, weight: 850 }));
  for (let i = 0; i <= 32; i += 8) {
    const bx = x + (i / 32) * w;
    root.appendChild(svg("line", { x1: bx, y1: y - 8, x2: bx, y2: y + h + 8, stroke: colors.line, "stroke-width": 1 }));
    root.appendChild(text(bx, y + h + 28, String(i), { anchor: "middle", fill: colors.muted, size: 11, weight: 650 }));
  }
}

function render() {
  $("prefixLabel").textContent = $("prefixInput").value;
  const root = $("cidrSvg");
  clear(root);
  root.appendChild(svg("title", {}, [document.createTextNode("Calculadora CIDR IPv4")]));
  try {
    const c = calculate();
    setText("maskOut", ipToString(c.mask));
    setText("networkOut", `${ipToString(c.network)}/${c.prefix}`);
    setText("totalOut", c.total.toLocaleString("es-ES"));
    setText("usableOut", c.usable.toLocaleString("es-ES"));
    renderBits(root, c.prefix);
    root.appendChild(text(90, 70, `${ipToString(c.ip)} pertenece a ${ipToString(c.network)}/${c.prefix}`, { fill: colors.ink, size: 20, weight: 850 }));
    root.appendChild(text(90, 112, `Rango: ${ipToString(c.network)} - ${ipToString(c.broadcast)} · máscara ${ipToString(c.mask)}`, { fill: colors.ink, size: 15, weight: 700 }));
    if ($("showBits").checked) {
      const bits = c.ip.toString(2).padStart(32, "0").replace(/(.{8})/g, "$1 ").trim();
      root.appendChild(text(90, 300, bits, { fill: colors.physical, size: 15, weight: 700 }));
    }
    const note = $("preset").value.startsWith("class")
      ? "Lectura histórica: hoy se describen los bloques con CIDR."
      : "Lectura moderna: prefijo CIDR y máscara describen el bloque.";
    root.appendChild(rect(90, 338, 740, 46, $("preset").value.startsWith("class") ? "#fff7ed" : colors.internetSoft, $("preset").value.startsWith("class") ? colors.warn : colors.internet));
    root.appendChild(text(110, 361, note, { fill: colors.ink, size: 14, weight: 800 }));
    setStatus("status", note, $("preset").value.startsWith("class") ? "warn" : "ok");
  } catch (error) {
    setStatus("status", error.message, "bad");
    root.appendChild(text(90, 180, error.message, { fill: colors.bad, size: 20, weight: 850 }));
  }
}

function applyPreset(name) {
  const [ip, prefix, note] = presets[name];
  $("ipInput").value = ip;
  $("prefixInput").value = prefix;
  setStatus("status", note);
  render();
}

$("preset").addEventListener("change", (event) => applyPreset(event.target.value));
$("ipInput").addEventListener("input", render);
$("prefixInput").addEventListener("input", render);
$("showBits").addEventListener("change", render);
$("applyBtn").addEventListener("click", render);
$("resetBtn").addEventListener("click", () => {
  $("preset").value = "lan";
  applyPreset("lan");
});
$("challengeBtn").addEventListener("click", () => {
  const prefix = Number($("prefixInput").value);
  const ok = prefix === 27;
  setStatus("challengeFeedback", ok ? "Correcto: /27 deja 5 bits de host, y 2^5 = 32 direcciones." : "Aún no: necesitas que 2^(32 - prefijo) sea 32.", ok ? "ok" : "warn");
});

applyPreset("lan");
