/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */
const $ = (id) => document.getElementById(id);
const nodes = { A:[90,190], B:[270,85], C:[270,295], D:[530,85], E:[530,295], F:[790,190] };
const links = [["A","B"],["A","C"],["B","D"],["C","E"],["B","E"],["C","D"],["D","F"],["E","F"]];
let packets = [];
function svgEl(name, attrs = {}) { const n = document.createElementNS("http://www.w3.org/2000/svg", name); Object.entries(attrs).forEach(([k,v]) => n.setAttribute(k,v)); return n; }
function label(svg, attrs, value) { const t = svgEl("text", attrs); t.textContent = value; svg.append(t); }
function usesBD(route) { return route.some((n, i) => n === "B" && route[i+1] === "D"); }
function routeDelay(route, congested) {
  let delay = (route.length - 1) * 10;
  if (congested && usesBD(route)) delay += 45;
  return delay;
}
function routesFor() {
  const mode = $("mode").value;
  const congested = $("congestion").checked;
  const failed = $("failure").checked;
  const datagramRoutes = failed
    ? [["A","C","E","F"],["A","B","E","F"],["A","C","D","F"],["A","C","E","F"],["A","B","E","F"]]
    : (congested ? [["A","C","E","F"],["A","B","E","F"],["A","C","D","F"],["A","B","D","F"],["A","C","E","F"]] : [["A","B","D","F"],["A","C","E","F"],["A","B","E","F"],["A","C","D","F"],["A","B","D","F"]]);
  const vcRoute = failed ? ["A","C","E","F"] : ["A","B","D","F"];
  const routes = mode === "vc" ? Array.from({ length: 5 }, () => vcRoute) : datagramRoutes;
  return routes.map((route, index) => ({
    id: "P" + (index + 1),
    expected: index + 1,
    route,
    arrival: routeDelay(route, congested) + (mode === "datagram" ? ((index * 11) % 23) : index * 2) + (mode === "vc" ? 18 : 0),
  }));
}
function draw() {
  const svg = $("networkSvg");
  svg.innerHTML = "";
  const congested = $("congestion").checked;
  const failed = $("failure").checked;
  links.forEach(([a,b]) => {
    const bd = a === "B" && b === "D";
    svg.append(svgEl("line", { x1: nodes[a][0], y1: nodes[a][1], x2: nodes[b][0], y2: nodes[b][1], stroke: failed && bd ? "#7f1d1d" : (congested && bd ? "#c2413d" : "#c7d2e5"), "stroke-width": failed && bd ? 8 : (congested && bd ? 6 : 2), "stroke-dasharray": failed && bd ? "8 8" : "", "stroke-linecap": "round" }));
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
  $("packetRows").innerHTML = packets.map((p) => `<tr><td>${p.id}</td><td>${p.route.join(" → ")}</td><td>${p.arrival.toFixed(0)} ms</td><td>${p.expected}</td><td>${orderMap[p.id] ?? "-"}</td></tr>`).join("");
  $("vcTable").innerHTML = mode === "vc"
    ? "<h2>Identificadores de circuito virtual</h2><p>Ejemplo simplificado: A-B usa IdCV 12, B-D usa IdCV 44 y D-F usa IdCV 08. Cada nodo mantiene estado para traducir el identificador local.</p>"
    : "<h2>Encaminamiento por paquete</h2><p>Cada datagrama incluye información suficiente para tomar decisiones de encaminamiento; la ruta puede cambiar por congestión o fallo.</p>";
}
function send() {
  packets = routesFor();
  draw();
  updateTables();
}
["mode","congestion","failure"].forEach((id) => $(id).addEventListener("input", send));
$("send").addEventListener("click", send);
send();
