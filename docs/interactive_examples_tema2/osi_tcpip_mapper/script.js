/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse ../../../LICENSE-0BSD, ../../../LICENSE-CC0 y ../../../LICENSES.md.
 */
import { $, clear, colors, initLabPage, line, rect, setStatus, svg, text } from "../shared/lab-utils.js";

initLabPage();

const osiLayers = ["Aplicación", "Presentación", "Sesión", "Transporte", "Red", "Enlace", "Físico"];
const tcpipLayers = ["Aplicación", "Transporte", "Internet", "Acceso a red"];
const layerPaint = {
  app: [colors.appSoft, colors.app],
  transport: [colors.transportSoft, colors.transport],
  internet: [colors.internetSoft, colors.internet],
  link: [colors.linkSoft, colors.link],
  physical: [colors.physicalSoft, colors.physical]
};

const rules = {
  HTTP: { osi: ["Aplicación"], tcpip: ["Aplicación"], note: "Protocolo de aplicación." },
  DNS: { osi: ["Aplicación"], tcpip: ["Aplicación"], note: "Resolución de nombres como servicio de aplicación." },
  TLS: { osi: ["Presentación"], tcpip: ["Aplicación"], note: "En OSI encaja con presentación; en Internet suele integrarse en librerías y protocolos de aplicación.", nuanced: true },
  TCP: { osi: ["Transporte"], tcpip: ["Transporte"], note: "Transporte extremo a extremo." },
  UDP: { osi: ["Transporte"], tcpip: ["Transporte"], note: "Transporte simple sin conexión." },
  QUIC: { osi: ["Transporte", "Presentación"], tcpip: ["Aplicación", "Transporte"], note: "Combina transporte y seguridad sobre UDP; conviene explicarlo como caso moderno con matiz.", nuanced: true },
  IP: { osi: ["Red"], tcpip: ["Internet"], note: "Encaminamiento entre redes." },
  ICMP: { osi: ["Red"], tcpip: ["Internet"], note: "Control y diagnóstico de la capa Internet." },
  Ethernet: { osi: ["Enlace", "Físico"], tcpip: ["Acceso a red"], note: "Tecnología de acceso local." },
  "Wi-Fi": { osi: ["Enlace", "Físico"], tcpip: ["Acceso a red"], note: "Acceso inalámbrico local." },
  "diálogo de sesión": { osi: ["Sesión"], tcpip: ["Aplicación"], note: "En TCP/IP suele quedar integrado en la aplicación." },
  "codificación/cifrado": { osi: ["Presentación"], tcpip: ["Aplicación"], note: "Función de presentación que a menudo implementan TLS o librerías." }
};

const presets = {
  classic: ["HTTP", "DNS", "TCP", "IP", "Ethernet"],
  modern: ["DNS", "TLS", "TCP", "QUIC", "IP", "Wi-Fi"],
  diagnostic: ["ICMP", "IP", "Ethernet"],
  all: Object.keys(rules)
};

let active = [...presets.classic];

function selectHtml(name, options) {
  return `<label><span class="label">${name}</span><select><option value="">Sin asignar</option>${options.map((o) => `<option value="${o}">${o}</option>`).join("")}</select></label>`;
}

function renderRows() {
  const root = $("mapperRows");
  root.innerHTML = active.map((item) => `
    <div class="mapper-row" data-item="${item}">
      <div><strong>${item}</strong><small>${rules[item].note}</small></div>
      ${selectHtml("OSI", osiLayers)}
      ${selectHtml("TCP/IP", tcpipLayers)}
    </div>
  `).join("");
  root.querySelectorAll("select").forEach((select) => select.addEventListener("change", renderSvg));
  renderSvg();
}

function rowValues(row) {
  const selects = row.querySelectorAll("select");
  return { osi: selects[0].value, tcpip: selects[1].value };
}

function checkRows() {
  let correct = 0;
  let nuanced = 0;
  $("mapperRows").querySelectorAll(".mapper-row").forEach((row) => {
    const item = row.dataset.item;
    const values = rowValues(row);
    const rule = rules[item];
    const osiOk = rule.osi.includes(values.osi);
    const tcpipOk = rule.tcpip.includes(values.tcpip);
    row.classList.remove("ok", "warn", "bad");
    if (osiOk && tcpipOk && rule.nuanced) {
      nuanced += 1;
      row.classList.add("warn");
    } else if (osiOk && tcpipOk) {
      correct += 1;
      row.classList.add("ok");
    } else {
      row.classList.add("bad");
    }
  });
  setStatus("status", `${correct} clasificaciones directas correctas; ${nuanced} correctas con matiz.`);
  renderSvg();
}

function renderSvg() {
  const root = $("mapSvg");
  clear(root);
  root.appendChild(svg("title", {}, [document.createTextNode("Correspondencia OSI y TCP/IP")]));
  const osiX = 90;
  const tcpX = 580;
  const y0 = 48;
  const osiH = 42;
  const tcpH = 72;
  root.appendChild(text(osiX + 130, 25, "OSI", { anchor: "middle", size: 16, weight: 850, fill: colors.ink }));
  root.appendChild(text(tcpX + 130, 25, "TCP/IP", { anchor: "middle", size: 16, weight: 850, fill: colors.ink }));
  osiLayers.forEach((layer, i) => {
    const key = i < 3 ? "app" : i === 3 ? "transport" : i === 4 ? "internet" : i === 5 ? "link" : "physical";
    const [fill, stroke] = layerPaint[key];
    root.appendChild(rect(osiX, y0 + i * (osiH + 4), 260, osiH, fill, stroke));
    root.appendChild(text(osiX + 16, y0 + i * (osiH + 4) + osiH / 2, layer, { fill: colors.ink, size: 13, weight: 750 }));
  });
  tcpipLayers.forEach((layer, i) => {
    const key = i === 0 ? "app" : i === 1 ? "transport" : i === 2 ? "internet" : "link";
    const [fill, stroke] = layerPaint[key];
    root.appendChild(rect(tcpX, y0 + i * (tcpH + 10), 260, tcpH, fill, stroke));
    root.appendChild(text(tcpX + 16, y0 + i * (tcpH + 10) + 22, layer, { fill: colors.ink, size: 14, weight: 850 }));
  });
  [["Aplicación", "Aplicación"], ["Transporte", "Transporte"], ["Red", "Internet"], ["Enlace", "Acceso a red"], ["Físico", "Acceso a red"]].forEach(([a, b]) => {
    const ay = y0 + osiLayers.indexOf(a) * (osiH + 4) + osiH / 2;
    const by = y0 + tcpipLayers.indexOf(b) * (tcpH + 10) + tcpH / 2;
    root.appendChild(line(osiX + 270, ay, tcpX - 10, by, colors.line, 2, { "stroke-dasharray": "9 8" }));
  });
}

function applyPreset(name) {
  active = [...presets[name]];
  renderRows();
  setStatus("status", "Escenario cargado. Clasifica cada elemento.");
}

$("preset").addEventListener("change", (event) => applyPreset(event.target.value));
$("checkBtn").addEventListener("click", checkRows);
$("hintBtn").addEventListener("click", () => {
  setStatus("status", "Pista: IP pertenece a Red/Internet; HTTP y DNS van arriba; Ethernet y Wi-Fi son acceso local.");
});
$("resetBtn").addEventListener("click", () => {
  $("preset").value = "classic";
  applyPreset("classic");
});
$("challengeBtn").addEventListener("click", () => {
  const okPreset = active.includes("TLS") && active.includes("QUIC");
  setStatus(
    "challengeFeedback",
    okPreset ? "Bien: TLS y QUIC son los elementos que obligan a explicar el matiz entre modelo y arquitectura real." : "Carga el preset “Web actual” para ver DNS, TLS, TCP, IP y Wi-Fi juntos.",
    okPreset ? "ok" : "warn"
  );
});

applyPreset("classic");
