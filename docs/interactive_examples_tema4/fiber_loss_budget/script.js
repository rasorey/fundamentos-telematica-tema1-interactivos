/*
 * Código fuente: 0BSD.
 * Contenido docente propio: CC0 1.0 Universal.
 * Véanse ../../../LICENSE-0BSD, ../../../LICENSE-CC0 y ../../../LICENSES.md.
 */
(() => {
  "use strict";

  const qs = new URLSearchParams(window.location.search);
  if (qs.get("embed") === "1") document.body.classList.add("embed");

  const $ = (id) => document.getElementById(id);
  const fmt = (value, digits = 1) => Number(value).toFixed(digits);
  const num = (id) => Number($(id).value);
  const splitterNames = {
    "0": "sin splitter",
    "3.5": "splitter 1:2",
    "7.2": "splitter 1:4",
    "10.5": "splitter 1:8",
    "13.8": "splitter 1:16",
    "17.1": "splitter 1:32"
  };

  function stateFromMargin(margin, recommended) {
    if (margin < 0) return ["bad", "No viable", "La potencia recibida queda por debajo de la sensibilidad del receptor."];
    if (margin < recommended) return ["warn", "Margen bajo", "El enlace funciona en el modelo, pero queda por debajo del margen recomendado."];
    return ["ok", "Viable", "El receptor recibe potencia suficiente y conserva margen frente a envejecimiento, curvaturas o reparaciones."];
  }

  function setStatus(kind, text) {
    $("fiberMessage").className = `status ${kind}`;
    $("fiberMessage").textContent = text;
    $("marginCard").className = `metric ${kind}`;
    $("stateCard").className = `metric ${kind}`;
  }

  function row(label, value) {
    return `<div class="breakdown-row"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function update() {
    const lengthKm = num("lengthKm");
    const attenuation = num("attenuation");
    const connectors = num("connectors");
    const connectorLoss = num("connectorLoss");
    const splices = num("splices");
    const spliceLoss = num("spliceLoss");
    const splitterLoss = num("splitter");
    const txPower = num("txPower");
    const sensitivity = num("rxSensitivity");
    const recommended = num("recommendedMargin");

    const fiberLoss = lengthKm * attenuation;
    const connectorTotal = connectors * connectorLoss;
    const spliceTotal = splices * spliceLoss;
    const totalLoss = fiberLoss + connectorTotal + spliceTotal + splitterLoss;
    const rxPower = txPower - totalLoss;
    const margin = rxPower - sensitivity;
    const [kind, state, message] = stateFromMargin(margin, recommended);

    $("lengthKmValue").textContent = `${fmt(lengthKm, 1)} km`;
    $("lossMetric").textContent = `${fmt(totalLoss, 1)} dB`;
    $("rxMetric").textContent = `${fmt(rxPower, 1)} dBm`;
    $("marginMetric").textContent = `${fmt(margin, 1)} dB`;
    $("stateMetric").textContent = state;
    setStatus(kind, message);

    $("lossBreakdown").innerHTML = [
      row(`Fibra: ${fmt(lengthKm, 1)} km x ${fmt(attenuation, 2)} dB/km`, `${fmt(fiberLoss, 1)} dB`),
      row(`Conectores: ${connectors} x ${fmt(connectorLoss, 2)} dB`, `${fmt(connectorTotal, 1)} dB`),
      row(`Empalmes: ${splices} x ${fmt(spliceLoss, 2)} dB`, `${fmt(spliceTotal, 1)} dB`),
      row(splitterNames[$("splitter").value] || "splitter", `${fmt(splitterLoss, 1)} dB`)
    ].join("");

    const warnings = [];
    if ($("linkType").value === "pon" && splitterLoss === 0) warnings.push("En PON suele existir pérdida de splitter; activa una relación para ver su impacto.");
    if (attenuation > 1 && $("linkType").value === "singlemode") warnings.push("Esa atenuación es alta para una fibra monomodo moderna; revisa unidades y ventana óptica.");
    if (margin < recommended) warnings.push("Tener luz no basta: interesa llegar con margen operacional.");
    $("warningList").innerHTML = warnings.map((item) => `<li>${item}</li>`).join("");

    draw({ lengthKm, totalLoss, txPower, rxPower, sensitivity, margin, recommended, kind, splitterLoss });
  }

  function draw(data) {
    const lossWidth = Math.min(410, Math.max(36, data.totalLoss * 13));
    const marginWidth = Math.min(310, Math.max(14, Math.abs(data.margin) * 16));
    const marker = data.kind === "ok" ? "margin-ok" : data.kind === "warn" ? "margin-warn" : "margin-bad";
    $("fiberSvg").innerHTML = `
      <svg viewBox="0 0 900 520" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <rect x="24" y="24" width="852" height="472" rx="18" fill="#f8fbff" stroke="#cbd6e6"/>
        <rect x="70" y="122" width="130" height="88" rx="12" fill="#e6f7fc" stroke="#0c88b8" stroke-width="3"/>
        <text x="135" y="156" text-anchor="middle" font-size="24" font-weight="800">Tx</text>
        <text x="135" y="185" text-anchor="middle" font-size="16">${fmt(data.txPower, 1)} dBm</text>
        <line x1="205" y1="166" x2="688" y2="166" class="fiber-line"/>
        <line x1="310" y1="166" x2="${310 + lossWidth}" y2="166" class="loss-line" opacity=".75"/>
        <text x="450" y="118" text-anchor="middle" font-size="18" font-weight="800">fibra + conectores + empalmes + splitter</text>
        <text x="450" y="220" text-anchor="middle" font-size="17">${fmt(data.totalLoss, 1)} dB de pérdida total</text>
        <rect x="700" y="122" width="130" height="88" rx="12" fill="#f0f3f7" stroke="#687385" stroke-width="3"/>
        <text x="765" y="156" text-anchor="middle" font-size="24" font-weight="800">Rx</text>
        <text x="765" y="185" text-anchor="middle" font-size="16">${fmt(data.rxPower, 1)} dBm</text>

        <text x="75" y="292" font-size="18" font-weight="800">Barra de potencia</text>
        <line x1="95" y1="342" x2="805" y2="342" stroke="#cbd6e6" stroke-width="18" stroke-linecap="round"/>
        <line x1="95" y1="342" x2="${95 + Math.min(620, Math.max(40, data.totalLoss * 18))}" y2="342" stroke="#c7352f" stroke-width="18" stroke-linecap="round"/>
        <circle cx="95" cy="342" r="18" fill="#0c88b8"/>
        <text x="95" y="390" text-anchor="middle" font-size="15">Tx</text>
        <circle cx="540" cy="342" r="18" fill="#687385"/>
        <text x="540" y="390" text-anchor="middle" font-size="15">Rx estimada</text>
        <circle cx="682" cy="342" r="18" fill="#183153"/>
        <text x="682" y="390" text-anchor="middle" font-size="15">sensibilidad</text>
        <rect x="695" y="323" width="${marginWidth}" height="38" rx="18" class="${marker}" opacity=".88"/>
        <text x="455" y="455" text-anchor="middle" font-size="24" font-weight="900">${data.kind === "bad" ? "Margen negativo" : `Margen ${fmt(data.margin, 1)} dB`}</text>
        <text x="455" y="478" text-anchor="middle" font-size="16">Margen recomendado: ${fmt(data.recommended, 1)} dB · Longitud: ${fmt(data.lengthKm, 1)} km</text>
      </svg>`;
  }

  function applyPreset(type) {
    if (type === "singlemode") {
      $("lengthKm").value = 10;
      $("attenuation").value = 0.35;
      $("txPower").value = 0;
      $("rxSensitivity").value = -24;
      $("splitter").value = 0;
    } else if (type === "multimode") {
      $("lengthKm").value = 0.3;
      $("attenuation").value = 3.0;
      $("txPower").value = -3;
      $("rxSensitivity").value = -11;
      $("splitter").value = 0;
    } else {
      $("lengthKm").value = 12;
      $("attenuation").value = 0.35;
      $("txPower").value = 3;
      $("rxSensitivity").value = -27;
      $("splitter").value = 17.1;
    }
  }

  document.querySelectorAll("input, select").forEach((control) => {
    control.addEventListener("input", update);
    control.addEventListener("change", () => {
      if (control.id === "linkType") applyPreset(control.value);
      update();
    });
  });

  $("resetBtn").addEventListener("click", () => {
    $("fiberForm").reset();
    update();
  });

  $("challengeBtn").addEventListener("click", () => {
    $("linkType").value = "pon";
    applyPreset("pon");
    update();
  });

  update();
})();
