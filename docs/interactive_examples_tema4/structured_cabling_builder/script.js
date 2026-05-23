/*
 * Código fuente: 0BSD.
 * Contenido docente propio: CC0 1.0 Universal.
 * Véanse ../../../LICENSE-0BSD, ../../../LICENSE-CC0 y ../../../LICENSES.md.
 */
(() => {
  "use strict";

  if (new URLSearchParams(window.location.search).get("embed") === "1") document.body.classList.add("embed");

  const $ = (id) => document.getElementById(id);
  const checked = (id) => $(id).checked;
  const num = (id) => Number($(id).value);

  const elements = {
    rack: { id: "showRack", label: "rack" },
    switch: { id: "showSwitch", label: "switch" },
    patch: { id: "showPatchPanel", label: "patch panel" },
    horizontal: { id: "showHorizontal", label: "cable horizontal" },
    outlet: { id: "showOutlet", label: "roseta" },
    patchCords: { id: "showPatchCords", label: "latiguillos" },
    endpoint: { id: "showEndpoint", label: "endpoint" }
  };

  function visible(key) {
    return checked(elements[key].id);
  }

  function li(items) {
    return items.map((item) => `<li>${item}</li>`).join("");
  }

  function update() {
    const permanent = [];
    if (visible("patch")) permanent.push("patch panel");
    if (visible("horizontal")) permanent.push("cable horizontal");
    if (visible("outlet")) permanent.push("roseta");

    const complete = [...permanent];
    if (visible("switch")) complete.unshift("switch");
    if (visible("patchCords")) complete.push("latiguillos");
    if (visible("endpoint")) complete.push("endpoint");

    const totalLength = num("horizontalLength") + num("patchLength");
    const warnings = [];
    let kind = "ok";
    let state = "Mantenible";
    let message = "El patch panel permite reorganizar conexiones con latiguillos.";

    if (!checked("labelsEnabled")) {
      warnings.push("Falta etiquetado: aumentan el tiempo de diagnóstico y el riesgo de desconexiones erróneas.");
      kind = "warn";
      state = "Revisar";
      message = "El etiquetado forma parte de la mantenibilidad, no es decoración.";
    }
    if (!visible("patch") || !visible("horizontal") || !visible("outlet")) {
      warnings.push("Sin patch panel, cable horizontal y roseta no hay canal permanente completo.");
      kind = "bad";
      state = "Incompleto";
      message = "El cableado estructurado necesita elementos fijos bien documentados.";
    }
    if ($("changePort").value === "horizontal") {
      warnings.push("Alterar el cable horizontal para cambiar un puerto rompe la lógica de infraestructura mantenible.");
      kind = "bad";
      state = "No mantenible";
      message = "El cambio correcto se hace con latiguillos, no rehaciendo el cable horizontal.";
    }
    if (totalLength > 100) {
      warnings.push("La longitud total supera 100 m; en muchos canales Ethernet de par trenzado es una referencia crítica.");
      kind = kind === "bad" ? "bad" : "warn";
      state = kind === "bad" ? state : "Revisar";
    }
    if ($("changePort").value === "port12" && kind !== "bad") {
      state = "Cambio limpio";
      message = "El usuario cambia de puerto moviendo un latiguillo; el cable horizontal permanece estable.";
    }

    $("permanentMetric").textContent = String(permanent.length);
    $("completeMetric").textContent = String(complete.length);
    $("lengthMetric").textContent = `${totalLength} m`;
    $("stateMetric").textContent = state;
    $("stateCard").className = `metric ${kind}`;
    $("cablingMessage").className = `status ${kind}`;
    $("cablingMessage").textContent = message;
    $("permanentList").innerHTML = li(permanent.length ? permanent : ["incompleto"]);
    $("completeList").innerHTML = li(complete.length ? complete : ["incompleto"]);
    $("warningList").innerHTML = li(warnings);

    draw({ kind, totalLength, permanent, complete });
  }

  function draw(data) {
    const mode = $("channelMode").value;
    const highlightPermanent = mode === "permanent";
    const labels = checked("labelsEnabled");
    const moved = $("changePort").value === "port12";
    const badMove = $("changePort").value === "horizontal";
    const color = data.kind === "ok" ? "#11875d" : data.kind === "warn" ? "#b77900" : "#b42318";
    const permanentStroke = highlightPermanent ? "#13835f" : "#8cc9b2";
    const completeStroke = highlightPermanent ? "#9aa9bb" : "#13835f";

    const rack = visible("rack") ? `<rect x="72" y="80" width="190" height="330" rx="16" fill="#f0f3f7" stroke="#687385" stroke-width="3"/>
      <text x="167" y="62" text-anchor="middle" font-size="18" font-weight="900">rack</text>` : "";
    const sw = visible("switch") ? `<rect x="102" y="120" width="130" height="42" rx="8" fill="#eaf2fb" stroke="#174a8b" stroke-width="3"/>
      <text x="167" y="147" text-anchor="middle" font-size="15" font-weight="800">switch</text>` : "";
    const patch = visible("patch") ? `<rect x="102" y="208" width="130" height="42" rx="8" fill="#e6f6ef" stroke="#13835f" stroke-width="3"/>
      <text x="167" y="235" text-anchor="middle" font-size="15" font-weight="800">patch panel</text>` : "";
    const outlet = visible("outlet") ? `<rect x="610" y="210" width="112" height="58" rx="10" fill="#e6f6ef" stroke="#13835f" stroke-width="3"/>
      <text x="666" y="245" text-anchor="middle" font-size="15" font-weight="800">roseta</text>` : "";
    const endpoint = visible("endpoint") ? `<rect x="748" y="194" width="96" height="90" rx="12" fill="#fff" stroke="#687385" stroke-width="3"/>
      <text x="796" y="235" text-anchor="middle" font-size="15" font-weight="900">puesto</text>
      <text x="796" y="256" text-anchor="middle" font-size="13">usuario</text>` : "";
    const horizontal = visible("horizontal") ? `<path d="M232 230 C346 230, 448 230, 610 238" fill="none" stroke="${permanentStroke}" stroke-width="18" stroke-linecap="round"/>
      <text x="425" y="208" text-anchor="middle" font-size="15" font-weight="800">cable horizontal ${num("horizontalLength")} m</text>` : "";
    const patchCords = visible("patchCords") ? `<path d="M167 162 L167 208" fill="none" stroke="${completeStroke}" stroke-width="10" stroke-linecap="round"/>
      <path d="M722 240 L748 240" fill="none" stroke="${completeStroke}" stroke-width="10" stroke-linecap="round"/>` : "";
    const labelsText = labels ? `<text x="166" y="300" text-anchor="middle" font-size="14" font-weight="800">A-03 / PP-07</text>
      <text x="666" y="302" text-anchor="middle" font-size="14" font-weight="800">A-03</text>` : "";
    const moveNote = moved ? `<path d="M238 140 C294 86, 332 86, 386 130" fill="none" stroke="#13835f" stroke-width="5" stroke-dasharray="8 8"/>
      <text x="326" y="74" text-anchor="middle" font-size="15" font-weight="900">cambio: solo latiguillo</text>` : "";
    const badNote = badMove ? `<path d="M318 260 L520 260" fill="none" stroke="#c7352f" stroke-width="7" stroke-dasharray="12 10"/>
      <text x="420" y="292" text-anchor="middle" font-size="15" font-weight="900">se toca el cable horizontal</text>` : "";

    $("cablingSvg").innerHTML = `
      <svg viewBox="0 0 900 520" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <rect x="24" y="24" width="852" height="472" rx="18" fill="#f8fbff" stroke="#cbd6e6"/>
        ${rack}
        ${sw}
        ${patch}
        ${patchCords}
        ${horizontal}
        ${outlet}
        ${endpoint}
        ${labelsText}
        ${moveNote}
        ${badNote}
        <rect x="84" y="438" width="724" height="32" rx="16" fill="${color}" opacity=".13" stroke="${color}" stroke-width="2"/>
        <text x="446" y="460" text-anchor="middle" font-size="16" font-weight="900">${highlightPermanent ? "Resaltado: canal permanente" : "Resaltado: canal completo"} · longitud total ${data.totalLength} m</text>
      </svg>`;
  }

  document.querySelectorAll("input, select").forEach((control) => {
    control.addEventListener("input", update);
    control.addEventListener("change", update);
  });

  $("resetBtn").addEventListener("click", () => {
    $("cablingForm").reset();
    update();
  });

  $("challengeBtn").addEventListener("click", () => {
    $("channelMode").value = "complete";
    $("changePort").value = "port12";
    $("labelsEnabled").checked = true;
    update();
  });

  update();
})();
