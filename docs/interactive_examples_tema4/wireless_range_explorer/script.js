/*
 * Código fuente: 0BSD.
 * Contenido docente propio: CC0 1.0 Universal.
 * Véanse ../../../LICENSE-0BSD, ../../../LICENSE-CC0 y ../../../LICENSES.md.
 */
(() => {
  "use strict";

  if (new URLSearchParams(window.location.search).get("embed") === "1") document.body.classList.add("embed");

  const $ = (id) => document.getElementById(id);
  const num = (id) => Number($(id).value);
  const fmt = (value, digits = 1) => Number(value).toFixed(digits);
  const bands = [
    { label: "2.4 GHz", fMHz: 2400 },
    { label: "5 GHz", fMHz: 5000 },
    { label: "6 GHz", fMHz: 6000 }
  ];

  function frequencyMHz() {
    return $("band").value === "custom" ? num("customFrequency") : Number($("band").value);
  }

  function fspl(fMHz, distanceM) {
    return 32.44 + 20 * Math.log10(fMHz) + 20 * Math.log10(Math.max(distanceM / 1000, 0.001));
  }

  function calculate(fMHz = frequencyMHz()) {
    const distanceM = num("distanceM");
    const lossFree = fspl(fMHz, distanceM);
    const obstacle = num("obstacle");
    const extra = num("extraLoss");
    const cable = num("cableLoss");
    const rxPower = num("txPower") + num("gainTx") + num("gainRx") - lossFree - obstacle - extra - cable;
    const margin = rxPower - num("rxSensitivity");
    const totalLoss = lossFree + obstacle + extra + cable;
    return { fMHz, distanceM, lossFree, obstacle, extra, cable, totalLoss, rxPower, margin };
  }

  function stateFromMargin(margin, recommended) {
    if (margin < 0) return ["bad", "No viable", "La potencia recibida queda por debajo de la sensibilidad del receptor."];
    if (margin < recommended) return ["warn", "Margen bajo", "El enlace funciona en este modelo, pero queda poco margen frente a cambios del entorno."];
    return ["ok", "Viable", "El enlace conserva margen suficiente en el modelo simplificado."];
  }

  function updateBandControls() {
    const custom = $("band").value === "custom";
    $("customFrequency").disabled = !custom;
    if (!custom) $("customFrequency").value = $("band").value;
  }

  function update() {
    updateBandControls();
    const data = calculate();
    const recommended = num("recommendedMargin");
    const [kind, state, message] = stateFromMargin(data.margin, recommended);

    $("distanceValue").textContent = `${fmt(data.distanceM, 0)} m`;
    $("fsplMetric").textContent = `${fmt(data.lossFree, 1)} dB`;
    $("rxMetric").textContent = `${fmt(data.rxPower, 1)} dBm`;
    $("marginMetric").textContent = `${fmt(data.margin, 1)} dB`;
    $("stateMetric").textContent = state;
    $("radioMessage").textContent = message;
    $("radioMessage").className = `status ${kind}`;
    $("marginCard").className = `metric ${kind}`;
    $("stateCard").className = `metric ${kind}`;

    $("bandCards").innerHTML = bands.map((band) => {
      const result = calculate(band.fMHz);
      const [bandKind, bandState] = stateFromMargin(result.margin, recommended);
      return `<article class="band-card metric ${bandKind}">
        <strong>${band.label}</strong>
        <span>FSPL ${fmt(result.lossFree, 1)} dB · margen ${fmt(result.margin, 1)} dB · ${bandState}</span>
      </article>`;
    }).join("");

    const warnings = [];
    if (data.fMHz > 5000 && data.distanceM > 200) warnings.push("A mayor frecuencia y distancia, el margen baja con rapidez si todo lo demás se mantiene.");
    if (data.obstacle > 0) warnings.push("El obstáculo se modela como una pérdida fija; en interiores reales intervienen multitrayecto e interferencias.");
    if (data.margin < recommended) warnings.push("Subir potencia no siempre es posible: hay límites normativos y de diseño.");
    $("warningList").innerHTML = warnings.map((item) => `<li>${item}</li>`).join("");

    draw(data, kind, recommended);
  }

  function draw(data, kind, recommended) {
    const color = kind === "ok" ? "#11875d" : kind === "warn" ? "#b77900" : "#b42318";
    const obstacleWidth = Math.min(170, Math.max(0, data.obstacle * 9));
    const distanceScale = Math.min(520, Math.max(70, data.distanceM * 0.58));
    const lossLine = Math.min(500, Math.max(90, data.totalLoss * 5.2));
    $("wirelessSvg").innerHTML = `
      <svg viewBox="0 0 900 520" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <rect x="24" y="24" width="852" height="472" rx="18" fill="#f8fbff" stroke="#cbd6e6"/>
        <rect x="74" y="164" width="120" height="86" rx="12" fill="#f1edff" stroke="#6f4bb8" stroke-width="3"/>
        <text x="134" y="198" text-anchor="middle" font-size="22" font-weight="900">Tx</text>
        <text x="134" y="225" text-anchor="middle" font-size="15">${fmt(num("txPower"), 1)} dBm</text>
        <rect x="706" y="164" width="120" height="86" rx="12" fill="#f0f3f7" stroke="#687385" stroke-width="3"/>
        <text x="766" y="198" text-anchor="middle" font-size="22" font-weight="900">Rx</text>
        <text x="766" y="225" text-anchor="middle" font-size="15">${fmt(data.rxPower, 1)} dBm</text>
        <path d="M202 206 C330 102, 570 102, 698 206" fill="none" stroke="#6f4bb8" stroke-width="12" stroke-linecap="round"/>
        <path d="M220 206 C350 132, 550 132, 680 206" fill="none" stroke="#c7352f" stroke-width="${Math.max(4, data.totalLoss / 7)}" stroke-linecap="round" opacity=".7"/>
        <rect x="${450 - obstacleWidth / 2}" y="132" width="${obstacleWidth}" height="154" rx="10" fill="#fff0ef" stroke="#c7352f" stroke-width="2" opacity="${data.obstacle > 0 ? 1 : .12}"/>
        <text x="450" y="118" text-anchor="middle" font-size="18" font-weight="800">${fmt(data.fMHz / 1000, 2)} GHz · ${fmt(data.distanceM, 0)} m</text>
        <text x="450" y="310" text-anchor="middle" font-size="16">pérdida total ${fmt(data.totalLoss, 1)} dB</text>

        <text x="78" y="372" font-size="18" font-weight="800">Pérdida frente a distancia</text>
        <line x1="98" y1="430" x2="805" y2="430" stroke="#cbd6e6" stroke-width="4"/>
        <line x1="98" y1="430" x2="${98 + distanceScale}" y2="430" stroke="#6f4bb8" stroke-width="10" stroke-linecap="round"/>
        <line x1="98" y1="456" x2="${98 + lossLine}" y2="456" stroke="#c7352f" stroke-width="10" stroke-linecap="round"/>
        <text x="115" y="414" font-size="14">distancia</text>
        <text x="115" y="482" font-size="14">pérdidas</text>
        <rect x="632" y="377" width="190" height="84" rx="14" fill="${color}" opacity=".12" stroke="${color}" stroke-width="3"/>
        <text x="727" y="410" text-anchor="middle" font-size="20" font-weight="900" fill="${color}">Margen ${fmt(data.margin, 1)} dB</text>
        <text x="727" y="438" text-anchor="middle" font-size="15">recomendado ${fmt(recommended, 1)} dB</text>
      </svg>`;
  }

  document.querySelectorAll("input, select").forEach((control) => {
    control.addEventListener("input", update);
    control.addEventListener("change", update);
  });

  $("resetBtn").addEventListener("click", () => {
    $("wirelessForm").reset();
    update();
  });

  $("compareBtn").addEventListener("click", () => {
    $("distanceM").value = 250;
    $("obstacle").value = 6;
    update();
  });

  update();
})();
