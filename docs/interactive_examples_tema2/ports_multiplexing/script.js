/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse ../../../LICENSE-0BSD, ../../../LICENSE-CC0 y ../../../LICENSES.md.
 */
import { $, arrow, clear, colors, initLabPage, randomEphemeral, rect, setStatus, setText, svg, text } from "../shared/lab-utils.js";

initLabPage();

const services = [
  { name: "FTP", protocol: "TCP", port: 21 },
  { name: "HTTP", protocol: "TCP", port: 80 },
  { name: "HTTPS", protocol: "TCP", port: 443 },
  { name: "DNS", protocol: "UDP", port: 53 }
];

const presets = {
  https: { protocol: "TCP", port: 443 },
  dns: { protocol: "UDP", port: 53 },
  http: { protocol: "TCP", port: 80 },
  ftp: { protocol: "TCP", port: 21 },
  closed: { protocol: "TCP", port: 9999 }
};

let packets = [];

function currentPacket() {
  return {
    protocol: $("protocol").value,
    sourceIp: "198.51.100.25",
    sourcePort: Number($("sourcePort").value),
    destIp: $("serverIp").value.trim(),
    destPort: Number($("destPort").value)
  };
}

function findService(packet) {
  return services.find((service) => service.protocol === packet.protocol && service.port === packet.destPort);
}

function socket(protocol, ip, port) {
  return `${protocol} ${ip}:${port}`;
}

function render() {
  const packet = packets.at(-1) || currentPacket();
  const app = findService(packet);
  setText("destApp", app ? app.name : "sin servicio");
  setText("clientSocket", socket(packet.protocol, packet.sourceIp, packet.sourcePort));
  setText("serverSocket", socket(packet.protocol, packet.destIp, packet.destPort));
  setText("packetCount", String(packets.length));

  const root = $("portsSvg");
  clear(root);
  root.appendChild(svg("title", {}, [document.createTextNode("Multiplexación y demultiplexación por puertos")]));
  root.appendChild(rect(70, 145, 185, 120, colors.internetSoft, colors.internet, { "stroke-width": 1.6 }));
  root.appendChild(text(162, 185, "Cliente", { anchor: "middle", fill: colors.internet, size: 18, weight: 850 }));
  root.appendChild(text(162, 220, packet.sourceIp, { anchor: "middle", fill: colors.ink, size: 13, weight: 700 }));

  root.appendChild(rect(660, 85, 190, 270, colors.internetSoft, colors.internet, { "stroke-width": 1.6 }));
  root.appendChild(text(755, 118, `Servidor ${packet.destIp}`, { anchor: "middle", fill: colors.internet, size: 15, weight: 850 }));
  services.forEach((service, i) => {
    const y = 150 + i * 48;
    const active = app && app.name === service.name;
    root.appendChild(rect(690, y, 130, 34, active ? colors.goldSoft : "#fff", active ? colors.gold : colors.line, { "stroke-width": active ? 3 : 1 }));
    root.appendChild(text(704, y + 17, service.name, { fill: service.protocol === "TCP" ? colors.transport : colors.app, size: 13, weight: 850 }));
    root.appendChild(text(808, y + 17, `${service.protocol}/${service.port}`, { anchor: "end", fill: colors.ink, size: 12, weight: 750 }));
  });

  const arrowColor = app ? colors.transport : colors.bad;
  root.appendChild(arrow(270, 205, 650, app ? 167 + services.indexOf(app) * 48 : 330, arrowColor, 3));
  root.appendChild(text(460, 182, `${packet.protocol} destino ${packet.destPort}`, { anchor: "middle", fill: arrowColor, size: 14, weight: 850 }));
  root.appendChild(text(460, 228, "IP elige máquina; puerto elige aplicación", { anchor: "middle", fill: colors.ink, size: 14, weight: 800 }));

  if ($("showSockets").checked) {
    root.appendChild(rect(110, 330, 700, 54, "#fff", colors.line));
    root.appendChild(text(130, 357, `Socket origen: ${socket(packet.protocol, packet.sourceIp, packet.sourcePort)}`, { fill: colors.ink, size: 13, weight: 750 }));
    root.appendChild(text(500, 357, `Socket destino: ${socket(packet.protocol, packet.destIp, packet.destPort)}`, { fill: colors.ink, size: 13, weight: 750 }));
  }
}

function send(packet = currentPacket()) {
  packets.push(packet);
  const app = findService(packet);
  setStatus("status", app ? `Entregado a ${app.name}: coincide ${packet.protocol}/${packet.destPort}.` : `No hay servicio escuchando en ${packet.protocol}/${packet.destPort}.`, app ? "ok" : "warn");
  render();
}

function applyPreset(name) {
  const preset = presets[name];
  $("protocol").value = preset.protocol;
  $("destPort").value = preset.port;
  $("sourcePort").value = randomEphemeral();
  render();
}

$("preset").addEventListener("change", (event) => applyPreset(event.target.value));
["protocol", "serverIp", "sourcePort", "destPort", "showSockets"].forEach((id) => $(id).addEventListener("input", render));
$("sendBtn").addEventListener("click", () => send());
$("multiBtn").addEventListener("click", () => {
  packets = [];
  [
    { protocol: "TCP", destPort: 80 },
    { protocol: "TCP", destPort: 443 },
    { protocol: "UDP", destPort: 53 }
  ].forEach((p) => send({ ...currentPacket(), ...p, sourcePort: randomEphemeral() }));
});
$("changePortBtn").addEventListener("click", () => {
  const ports = [21, 80, 443, 53, 9999];
  const current = Number($("destPort").value);
  $("destPort").value = ports[(ports.indexOf(current) + 1) % ports.length] || 21;
  render();
});
$("resetBtn").addEventListener("click", () => {
  packets = [];
  $("preset").value = "https";
  applyPreset("https");
  setStatus("status", "Estado reiniciado.");
});
$("challengeBtn").addEventListener("click", () => {
  const packet = currentPacket();
  const ok = packet.protocol === "TCP" && packet.destPort === 443;
  setStatus("challengeFeedback", ok ? "Correcto: TCP + IP del servidor + puerto 443 identifica el servicio HTTPS." : "Aún no: configura TCP y puerto destino 443.", ok ? "ok" : "warn");
});

applyPreset("https");
