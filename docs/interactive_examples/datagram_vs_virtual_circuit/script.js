/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */
function setupEmbedUi() {
  if (new URLSearchParams(location.search).get("embed") !== "1") return;
  document.body.classList.add("embed");
  const open = document.createElement("a");
  open.className = "button embed-open";
  open.href = location.pathname;
  open.target = "_blank";
  open.rel = "noopener";
  open.textContent = "Abrir en navegador";
  document.body.append(open);
}
setupEmbedUi();
const $ = (id) => document.getElementById(id);
const nodes = { A:[90,190], B:[270,85], C:[270,295], D:[530,85], E:[530,295], F:[790,190] };
const links = [["A","B"],["A","C"],["B","D"],["C","E"],["B","E"],["C","D"],["D","F"],["E","F"]];
let packets = [];
let challenge = null;
function svgEl(name, attrs = {}) { const n = document.createElementNS("http://www.w3.org/2000/svg", name); Object.entries(attrs).forEach(([k,v]) => n.setAttribute(k,v)); return n; }
function label(svg, attrs, value) { const t = svgEl("text", attrs); t.textContent = value; svg.append(t); }
function keyFor(a, b) { return [a, b].sort().join(""); }
function selected(id) { return $(id).value; }
function routeUses(route, key) { return route.some((n, i) => route[i + 1] && keyFor(n, route[i + 1]) === key); }
function routeDelay(route, congested) {
  let delay = (route.length - 1) * Number($("baseWeight").value);
  if (congested && routeUses(route, selected("congestionLink"))) delay += 45;
  return delay;
}
function routesFor() {
  const mode = $("mode").value;
  const congested = $("congestion").checked;
  const failedKey = $("failure").checked ? selected("failureLink") : "";
  const candidates = [["A","B","D","F"],["A","C","E","F"],["A","B","E","F"],["A","C","D","F"],["A","B","D","F"]];
  const alternate = [["A","C","E","F"],["A","B","E","F"],["A","C","D","F"],["A","C","E","F"],["A","B","E","F"]];
  const allowed = (congested ? alternate : candidates).filter((r) => !failedKey || !routeUses(r, failedKey));
  const datagramRoutes = allowed.length ? allowed : [["A","C","E","F"]];
  const vcRoute = datagramRoutes[0];
  const routes = mode === "vc" ? Array.from({ length: 5 }, () => vcRoute) : Array.from({ length: 5 }, (_, i) => datagramRoutes[i % datagramRoutes.length]);
  return routes.map((route, index) => ({
    id: "P" + (index + 1),
    expected: index + 1,
    route,
    arrival: routeDelay(route, congested) + (mode === "datagram" ? ((index * 11) % 23) : index * 2) + (mode === "vc" ? 18 : 0),
  }));
}
function draw() {
  const svg = $("networkSvg");
  svg.replaceChildren();
  const congested = $("congestion").checked;
  const failed = $("failure").checked;
  const congestedKey = selected("congestionLink");
  const failedKey = selected("failureLink");
  links.forEach(([a,b]) => {
    const key = keyFor(a, b);
    const isFailed = failed && key === failedKey;
    const isCongested = congested && key === congestedKey;
    svg.append(svgEl("line", { x1: nodes[a][0], y1: nodes[a][1], x2: nodes[b][0], y2: nodes[b][1], stroke: isFailed ? "#7f1d1d" : (isCongested ? "#c2413d" : "#c7d2e5"), "stroke-width": isFailed ? 8 : (isCongested ? 6 : 2), "stroke-dasharray": isFailed ? "8 8" : "", "stroke-linecap": "round" }));
    label(svg, { x: (nodes[a][0]+nodes[b][0])/2, y: (nodes[a][1]+nodes[b][1])/2 - 6, fill: "#516483", "font-size": 10, "text-anchor": "middle" }, Number($("baseWeight").value) + " ms");
  });
  const colors = ["#1f3f88", "#007c89", "#f59e0b", "#5969b3", "#138a63"];
  packets.forEach((packet, index) => {
    for (let i = 0; i < packet.route.length - 1; i++) {
      const a = packet.route[i], b = packet.route[i+1];
      svg.append(svgEl("line", { x1: nodes[a][0], y1: nodes[a][1] + index * 2, x2: nodes[b][0], y2: nodes[b][1] + index * 2, stroke: colors[index], "stroke-width": 4, opacity: .72 }));
    }
  });
  Object.entries(nodes).forEach(([name, [x,y]]) => {
    const end = name === "A" || name === "F";
    svg.append(svgEl("circle", { cx: x, cy: y, r: 25, fill: end ? "#1f3f88" : "#fff", stroke: "#1f3f88", "stroke-width": 2 }));
    label(svg, { x, y: y + 5, "text-anchor": "middle", fill: end ? "#fff" : "#17315f", "font-weight": 900 }, name);
  });
}
function updateTables() {
  const mode = $("mode").value;
  $("flex").textContent = mode === "datagram" ? "alta" : "media";
  $("setup").textContent = mode === "datagram" ? "no" : "sí";
  $("state").textContent = mode === "datagram" ? "bajo" : "por circuito";
  const arrivalOrder = [...packets].sort((a,b) => a.arrival - b.arrival).map((p, i) => [p.id, i + 1]);
  const orderMap = Object.fromEntries(arrivalOrder);
  const rows = $("packetRows");
  while (rows.firstChild) rows.removeChild(rows.firstChild);
  packets.forEach((p) => {
    const tr = document.createElement("tr");
    [p.id, p.route.join(" → "), p.arrival.toFixed(0) + " ms", String(p.expected), String(orderMap[p.id] ?? "-")].forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.append(td);
    });
    rows.append(tr);
  });
  const info = $("vcTable");
  info.replaceChildren();
  const h2 = document.createElement("h2");
  const p = document.createElement("p");
  if (mode === "vc") {
    h2.textContent = "Identificadores de circuito virtual";
    p.textContent = "Ejemplo simplificado: A-B usa IdCV 12, B-D usa IdCV 44 y D-F usa IdCV 08. Cada nodo mantiene estado para traducir el identificador local. Si falla la ruta, puede requerirse reestablecer el circuito.";
  } else {
    h2.textContent = "Encaminamiento por paquete";
    p.textContent = "Cada datagrama incluye información suficiente para tomar decisiones de encaminamiento; la ruta puede cambiar por congestión o fallo y puede aparecer desorden.";
  }
  info.append(h2, p);
}
function send() {
  packets = routesFor();
  draw();
  updateTables();
}
["mode","congestion","failure","congestionLink","failureLink","baseWeight"].forEach((id) => $(id).addEventListener("input", send));
$("send").addEventListener("click", send);
$("resetBtn").addEventListener("click", () => {
  $("mode").value = "datagram";
  $("congestion").checked = false;
  $("failure").checked = false;
  $("congestionLink").value = "BD";
  $("failureLink").value = "BD";
  $("baseWeight").value = 10;
  send();
});
$("explainBtn").addEventListener("click", () => {
  send();
  const info = $("vcTable");
  const note = document.createElement("p");
  note.className = "mini-note";
  note.textContent = $("mode").value === "datagram"
    ? "Observa si el orden real coincide con el esperado: rutas distintas pueden sumar retardos distintos."
    : "Observa que todos los paquetes usan la misma ruta lógica y que el estado del circuito simplifica la decisión por paquete.";
  info.append(note);
});
function newChallenge() {
  const mode = Math.random() < 0.55 ? "datagram" : "vc";
  const congested = Math.random() < 0.6;
  challenge = { mode, congested, disorder: mode === "datagram" };
  $("challengeQuestion").textContent = `Caso: modo ${mode === "datagram" ? "datagrama" : "circuito virtual"}${congested ? " con congestión" : " sin congestión destacada"}. ¿Puede aparecer desorden con más facilidad?`;
  $("challengeFeedback").textContent = "";
  $("challengeFeedback").className = "challenge-feedback";
}
function checkChallenge() {
  if (!challenge) newChallenge();
  const ok = $("challengeAnswer").value === (challenge.disorder ? "sí" : "no");
  $("challengeFeedback").className = "challenge-feedback " + (ok ? "ok" : "warning");
  $("challengeFeedback").textContent = ok
    ? (challenge.disorder ? "Correcto: en datagrama cada paquete puede seguir rutas con retardos distintos." : "Correcto: en circuito virtual los paquetes siguen la ruta lógica establecida y normalmente conservan orden.")
    : "No todavía. Pregúntate si la decisión de ruta se toma por paquete o en una fase previa de establecimiento.";
}
$("challengeNew").addEventListener("click", newChallenge);
$("challengeCheck").addEventListener("click", checkChallenge);
send();
newChallenge();
