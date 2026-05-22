/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */

(() => {
  const slideFrame = document.querySelector("#slide-frame");
  const counter = document.querySelector("#slide-counter");
  const title = document.querySelector("#slide-title");
  const progress = document.querySelector("#progress-bar");
  const prevButton = document.querySelector("#prev-slide");
  const nextButton = document.querySelector("#next-slide");
  const fullscreenButton = document.querySelector("#fullscreen-button");
  const overviewToggle = document.querySelector("#overview-toggle");
  const overviewClose = document.querySelector("#overview-close");
  const overviewPanel = document.querySelector("#overview-panel");
  const overviewList = document.querySelector("#overview-list");
  const debugPanel = document.querySelector("#debug-panel");

  const params = new URLSearchParams(window.location.search);
  const debug = params.get("debug") === "1";
  const interactions = typeof INTERACTIONS !== "undefined" ? INTERACTIONS : [];
  const pollsConfig = typeof POLLS !== "undefined" ? POLLS : {};
  const pollOverlay = typeof POLL_OVERLAY !== "undefined" ? POLL_OVERLAY : { x: 0.3, y: 0.18, w: 0.59, h: 0.58 };
  const slideCount = typeof SLIDE_COUNT !== "undefined" ? SLIDE_COUNT : 50;
  const slideTitles = typeof SLIDE_TITLES !== "undefined" ? SLIDE_TITLES : [];
  const assetVersion = typeof SLIDE_ASSET_VERSION !== "undefined" ? SLIDE_ASSET_VERSION : "2026-05-22-step04";

  let current = getIndexFromHash();
  const backgroundCache = new Map();
  const overlayStates = new Map();

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function padSlideNumber(slideNumber) {
    return String(slideNumber).padStart(2, "0");
  }

  function getIndexFromHash() {
    const match = window.location.hash.match(/#\/?(\d+)/);
    if (!match) return 0;
    return clamp(Number(match[1]) - 1, 0, slideCount - 1);
  }

  function slideTitle(slideNumber) {
    return slideTitles[slideNumber - 1] || `Diapositiva ${slideNumber}`;
  }

  function backgroundUrl(slideNumber) {
    return `./assets/slide-backgrounds/slide-${padSlideNumber(slideNumber)}.png?v=${encodeURIComponent(assetVersion)}`;
  }

  function preloadBackground(slideNumber) {
    if (slideNumber < 1 || slideNumber > slideCount || backgroundCache.has(slideNumber)) return;
    const image = new Image();
    image.src = backgroundUrl(slideNumber);
    backgroundCache.set(slideNumber, image);
  }

  function preloadNeighborhood(slideNumber) {
    [slideNumber - 1, slideNumber, slideNumber + 1].forEach(preloadBackground);
  }

  function applyRect(element, rect) {
    Object.assign(element.style, {
      left: `${rect.x * 100}%`,
      top: `${rect.y * 100}%`,
      width: `${rect.w * 100}%`,
      height: `${rect.h * 100}%`
    });
  }

  function createSlideBackground(slideNumber) {
    const img = document.createElement("img");
    img.className = "slide-bg";
    img.src = backgroundUrl(slideNumber);
    img.alt = `Diapositiva ${slideNumber}: ${slideTitle(slideNumber)}`;
    img.decoding = "async";
    img.draggable = false;
    return img;
  }

  function interactionsForSlide(slideNumber) {
    const active = interactions.filter((interaction) => interaction.slide === slideNumber);
    Object.entries(pollsConfig).forEach(([key, poll]) => {
      if (poll.slide === slideNumber) active.push({ type: "poll", key, ...pollOverlay, ...poll });
    });
    return active;
  }

  function createSimulatorOverlay(interaction, index) {
    const overlay = document.createElement("div");
    overlay.className = "activity-overlay";
    overlay.dataset.loaded = "false";
    overlay.dataset.kind = "simulator";
    applyRect(overlay, interaction);

    const stateKey = `slide-${interaction.slide}-${index}`;
    overlayStates.set(stateKey, { status: "cargando", url: interaction.embedUrl });

    const iframe = document.createElement("iframe");
    iframe.src = interaction.embedUrl;
    iframe.title = `Simulador: ${interaction.title}`;
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    iframe.addEventListener("load", () => {
      overlay.dataset.loaded = "true";
      overlayStates.set(stateKey, { status: "cargado", url: interaction.embedUrl });
      renderDebug(interactionsForSlide(current + 1));
    });
    iframe.addEventListener("error", () => {
      overlay.dataset.loaded = "error";
      overlayStates.set(stateKey, { status: "error", url: interaction.embedUrl });
      renderDebug(interactionsForSlide(current + 1));
    });

    const message = document.createElement("div");
    message.className = "iframe-message";
    message.textContent = "Si el simulador no carga, usa el botón para abrirlo en navegador.";

    const toolbar = document.createElement("div");
    toolbar.className = "overlay-toolbar";
    toolbar.append(createFocusButton(), createOpenButton(interaction.openUrl, "Abrir en navegador"));

    overlay.append(iframe, message, toolbar);
    addDebugChrome(overlay, `simulador · ${interaction.title}`, interaction);
    return overlay;
  }

  function createPollOverlay(poll, index) {
    const overlay = document.createElement("div");
    overlay.className = "polls-overlay";
    overlay.dataset.loaded = "false";
    overlay.dataset.kind = "poll";
    applyRect(overlay, poll);
    const stateKey = `poll-${poll.slide}-${index}`;

    if (poll.displayUrl) {
      const iframe = document.createElement("iframe");
      iframe.src = poll.displayUrl;
      iframe.title = `Resultados de encuesta · ${poll.title}`;
      iframe.loading = "lazy";
      iframe.addEventListener("load", () => {
        overlay.dataset.loaded = "true";
        overlayStates.set(stateKey, { status: "cargado", url: poll.displayUrl });
        renderDebug(interactionsForSlide(current + 1));
      });
      iframe.addEventListener("error", () => {
        overlay.dataset.loaded = "error";
        overlayStates.set(stateKey, { status: "error", url: poll.displayUrl });
        renderDebug(interactionsForSlide(current + 1));
      });
      overlay.append(iframe);
      overlayStates.set(stateKey, { status: "cargando", url: poll.displayUrl });
    } else {
      const fallback = document.createElement("div");
      fallback.className = "polls-fallback";
      const content = document.createElement("div");
      const heading = document.createElement("strong");
      heading.textContent = "Encuesta de aula";
      const text = document.createElement("p");
      text.textContent = "Actividad disponible desde el aula virtual.";
      content.append(heading, text);
      fallback.append(content);
      overlay.append(fallback);
      overlay.dataset.loaded = "fallback";
      overlayStates.set(stateKey, { status: "fallback", url: "" });
    }

    const toolbar = document.createElement("div");
    toolbar.className = "overlay-toolbar";
    toolbar.append(createFocusButton());
    if (poll.studentUrl) toolbar.append(createOpenButton(poll.studentUrl, "Responder"));
    if (poll.displayOpenUrl || poll.displayUrl) toolbar.append(createOpenButton(poll.displayOpenUrl || poll.displayUrl, "Abrir resultados"));
    overlay.append(toolbar);

    addDebugChrome(overlay, `encuesta · ${poll.title || poll.key}`, poll);
    return overlay;
  }

  function createOpenButton(url, label) {
    const link = document.createElement("a");
    link.className = "open-button";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = label;
    return link;
  }

  function createFocusButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "focus-button";
    button.textContent = "Volver a navegar";
    button.addEventListener("click", () => slideFrame.focus({ preventScroll: true }));
    return button;
  }

  function addDebugChrome(overlay, label, rect) {
    if (!debug) return;
    overlay.classList.add("debug-outline");
    const badge = document.createElement("div");
    badge.className = "debug-label";
    badge.textContent = `${label} · x:${rect.x} y:${rect.y} w:${rect.w} h:${rect.h}`;
    overlay.append(badge);
  }

  function renderSlide() {
    const slideNumber = current + 1;
    const activeInteractions = interactionsForSlide(slideNumber);
    overlayStates.clear();
    slideFrame.replaceChildren(createSlideBackground(slideNumber));
    slideFrame.setAttribute("aria-label", `Diapositiva ${slideNumber}: ${slideTitle(slideNumber)}`);

    activeInteractions.forEach((interaction, index) => {
      const overlay = interaction.type === "poll"
        ? createPollOverlay(interaction, index)
        : createSimulatorOverlay(interaction, index);
      slideFrame.append(overlay);
    });

    counter.textContent = `${slideNumber} / ${slideCount}`;
    title.textContent = slideTitle(slideNumber);
    progress.style.width = `${(slideNumber / slideCount) * 100}%`;
    prevButton.disabled = current === 0;
    nextButton.disabled = current === slideCount - 1;
    renderDebug(activeInteractions);
    updateOverviewCurrent();
    preloadNeighborhood(slideNumber);
  }

  function renderDebug(activeInteractions) {
    if (!debug) return;
    debugPanel.hidden = false;
    const slideNumber = current + 1;
    const rows = activeInteractions.map((item, index) => {
      const key = `${item.type === "poll" ? "poll" : "slide"}-${item.slide}-${index}`;
      const state = overlayStates.get(key) || { status: "sin estado", url: item.embedUrl || item.displayUrl || "" };
      return `<li><code>${escapeHtml(item.type)}</code> ${escapeHtml(item.title || item.key || "")}<br>URL: ${escapeHtml(state.url || "sin URL")}<br>Estado: ${escapeHtml(state.status)}</li>`;
    }).join("");
    debugPanel.innerHTML = `
      <h2>Debug Tema 3</h2>
      <p>Diapositiva ${slideNumber} de ${slideCount}</p>
      <p>Overlays activos: ${activeInteractions.length}</p>
      <ul>${rows || "<li>sin overlays</li>"}</ul>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function goTo(index) {
    current = clamp(index, 0, slideCount - 1);
    const targetHash = `#/${current + 1}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, "", targetHash);
    }
    renderSlide();
  }

  function next() { goTo(current + 1); }
  function previous() { goTo(current - 1); }

  function buildOverview() {
    overviewList.replaceChildren();
    for (let i = 1; i <= slideCount; i += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "overview-item";
      button.dataset.slide = String(i);
      const number = document.createElement("span");
      number.className = "overview-number";
      number.textContent = padSlideNumber(i);
      const label = document.createElement("span");
      label.className = "overview-title";
      label.textContent = slideTitle(i);
      button.append(number, label);
      button.addEventListener("click", () => {
        overviewPanel.hidden = true;
        overviewToggle.setAttribute("aria-pressed", "false");
        goTo(i - 1);
        slideFrame.focus({ preventScroll: true });
      });
      overviewList.append(button);
    }
    updateOverviewCurrent();
  }

  function updateOverviewCurrent() {
    overviewList.querySelectorAll(".overview-item").forEach((item) => {
      item.setAttribute("aria-current", Number(item.dataset.slide) === current + 1 ? "true" : "false");
    });
  }

  prevButton.addEventListener("click", previous);
  nextButton.addEventListener("click", next);
  overviewToggle.addEventListener("click", () => {
    overviewPanel.hidden = !overviewPanel.hidden;
    overviewToggle.setAttribute("aria-pressed", overviewPanel.hidden ? "false" : "true");
  });
  overviewClose.addEventListener("click", () => {
    overviewPanel.hidden = true;
    overviewToggle.setAttribute("aria-pressed", "false");
  });
  fullscreenButton.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      slideFrame.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });
  window.addEventListener("hashchange", () => goTo(getIndexFromHash()));
  window.addEventListener("keydown", (event) => {
    if (event.target && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      next();
    }
    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      previous();
    }
    if (event.key === "Home") goTo(0);
    if (event.key === "End") goTo(slideCount - 1);
    if (event.key === "Escape" && !overviewPanel.hidden) {
      overviewPanel.hidden = true;
      overviewToggle.setAttribute("aria-pressed", "false");
    }
  });

  buildOverview();
  renderSlide();
})();
