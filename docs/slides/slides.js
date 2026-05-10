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
  const pollsConfig = typeof POLLS !== "undefined" ? POLLS : {};
  const interactions = typeof INTERACTIONS !== "undefined" ? INTERACTIONS : [];
  const pollOverlay = typeof POLL_OVERLAY !== "undefined" ? POLL_OVERLAY : { x: 0.3, y: 0.17, w: 0.61, h: 0.61 };
  const slideCount = typeof SLIDE_COUNT !== "undefined" ? SLIDE_COUNT : 67;
  const slideTitles = typeof SLIDE_TITLES !== "undefined" ? SLIDE_TITLES : [];
  const assetVersion = typeof SLIDE_ASSET_VERSION !== "undefined" ? SLIDE_ASSET_VERSION : "2026-05-10-polls-vps";

  let current = getIndexFromHash();
  const backgroundCache = new Map();

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

  function thumbnailUrl(slideNumber) {
    return `./assets/thumbnails/slide-${padSlideNumber(slideNumber)}.jpg?v=${encodeURIComponent(assetVersion)}`;
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

  function cssRect(rect) {
    return {
      left: `${rect.x * 100}%`,
      top: `${rect.y * 100}%`,
      width: `${rect.w * 100}%`,
      height: `${rect.h * 100}%`
    };
  }

  function applyRect(element, rect) {
    const values = cssRect(rect);
    Object.assign(element.style, values);
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
    const slideInteractions = interactions.filter((interaction) => interaction.slide === slideNumber);
    Object.entries(pollsConfig).forEach(([key, poll]) => {
      if (poll.slide === slideNumber) {
        slideInteractions.push({ type: "poll", key, ...poll, ...pollOverlay });
      }
    });
    return slideInteractions;
  }

  function createSimulatorOverlay(interaction) {
    const overlay = document.createElement("div");
    overlay.className = "activity-overlay";
    overlay.dataset.loaded = "false";
    overlay.dataset.kind = "simulator";
    applyRect(overlay, interaction);

    const iframe = document.createElement("iframe");
    iframe.src = interaction.embedUrl;
    iframe.title = `Simulador: ${interaction.title}`;
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    iframe.addEventListener("load", () => {
      overlay.dataset.loaded = "true";
    });

    const message = document.createElement("div");
    message.className = "iframe-message";
    message.textContent = "Si el simulador no carga, usa el botón para abrirlo en navegador.";

    const toolbar = document.createElement("div");
    toolbar.className = "overlay-toolbar";
    toolbar.append(createFocusButton(), createOpenButton(interaction.openUrl, "Abrir en navegador"));

    overlay.append(iframe, message, toolbar);
    addDebugChrome(overlay, `simulator · ${interaction.title}`, interaction);
    return overlay;
  }

  function createPollOverlay(poll) {
    const overlay = document.createElement("div");
    overlay.className = "polls-overlay";
    overlay.dataset.kind = "poll";
    overlay.dataset.loaded = "false";
    applyRect(overlay, poll);

    if (poll.displayUrl) {
      const iframe = document.createElement("iframe");
      iframe.src = poll.displayUrl;
      iframe.title = `Resultados de encuesta · ${poll.title}`;
      iframe.loading = "lazy";
      iframe.addEventListener("load", () => {
        overlay.dataset.loaded = "true";
      });
      overlay.append(iframe);
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
    }

    const toolbar = document.createElement("div");
    toolbar.className = "overlay-toolbar";
    toolbar.append(createFocusButton());
    if (poll.studentUrl) {
      toolbar.append(createOpenButton(poll.studentUrl, "Responder"));
    }
    if (poll.displayOpenUrl || poll.displayUrl) {
      toolbar.append(createOpenButton(poll.displayOpenUrl || poll.displayUrl, "Abrir resultados"));
    }
    overlay.append(toolbar);

    addDebugChrome(overlay, `poll · ${poll.title}`, poll);
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
    button.addEventListener("click", () => {
      slideFrame.focus({ preventScroll: true });
    });
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
    slideFrame.replaceChildren(createSlideBackground(slideNumber));
    slideFrame.setAttribute("aria-label", `Diapositiva ${slideNumber}: ${slideTitle(slideNumber)}`);

    activeInteractions.forEach((interaction) => {
      const overlay = interaction.type === "poll"
        ? createPollOverlay(interaction)
        : createSimulatorOverlay(interaction);
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
    const missingPolls = Object.values(pollsConfig).filter((poll) => !poll.displayUrl);
    const rows = activeInteractions.map((item) => {
      const url = item.embedUrl || item.openUrl || "";
      return `<li><code>${item.type}</code> ${escapeHtml(item.title || item.key)}<br>x=${item.x}, y=${item.y}, w=${item.w}, h=${item.h}<br>${escapeHtml(url || "sin URL embed")}</li>`;
    }).join("");
    debugPanel.innerHTML = `
      <h2>Debug slides</h2>
      <p><strong>Diapositiva:</strong> ${slideNumber} / ${slideCount}</p>
      <p><strong>Overlays activos:</strong> ${activeInteractions.length}</p>
      <ul>${rows || "<li>Sin overlays en esta diapositiva.</li>"}</ul>
      <p><strong>Encuestas sin displayUrl:</strong> ${missingPolls.length}</p>
    `;
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function showSlide(index, updateHash = true) {
    current = clamp(index, 0, slideCount - 1);
    renderSlide();
    if (updateHash) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/${current + 1}`);
    }
  }

  function nextSlide() {
    showSlide(current + 1);
  }

  function previousSlide() {
    showSlide(current - 1);
  }

  function buildOverview() {
    overviewList.replaceChildren();
    for (let slideNumber = 1; slideNumber <= slideCount; slideNumber += 1) {
      const link = document.createElement("a");
      link.className = "overview-link";
      link.href = `#/${slideNumber}`;
      link.dataset.slide = String(slideNumber);

      const img = document.createElement("img");
      img.src = thumbnailUrl(slideNumber);
      img.alt = `Miniatura de la diapositiva ${slideNumber}`;
      img.loading = "lazy";

      const number = document.createElement("span");
      number.textContent = `Diapositiva ${slideNumber}`;
      const label = document.createElement("strong");
      label.textContent = slideTitle(slideNumber);

      link.append(img, number, label);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        closeOverview();
        showSlide(slideNumber - 1);
      });
      overviewList.append(link);
    }
    updateOverviewCurrent();
  }

  function updateOverviewCurrent() {
    overviewList.querySelectorAll("[aria-current]").forEach((link) => link.removeAttribute("aria-current"));
    const currentLink = overviewList.querySelector(`[data-slide="${current + 1}"]`);
    currentLink?.setAttribute("aria-current", "true");
  }

  function openOverview() {
    overviewPanel.hidden = false;
    overviewToggle.setAttribute("aria-pressed", "true");
    updateOverviewCurrent();
    overviewList.querySelector(`[data-slide="${current + 1}"]`)?.focus();
  }

  function closeOverview() {
    overviewPanel.hidden = true;
    overviewToggle.setAttribute("aria-pressed", "false");
    slideFrame.focus({ preventScroll: true });
  }

  function toggleOverview() {
    if (overviewPanel.hidden) openOverview();
    else closeOverview();
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }

  function handleKeydown(event) {
    const tag = event.target?.tagName;
    const editing = ["INPUT", "TEXTAREA", "SELECT"].includes(tag);
    if (editing) return;

    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      nextSlide();
    } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      previousSlide();
    } else if (event.key === "Home") {
      event.preventDefault();
      showSlide(0);
    } else if (event.key === "End") {
      event.preventDefault();
      showSlide(slideCount - 1);
    } else if (event.key.toLowerCase() === "o") {
      event.preventDefault();
      toggleOverview();
    } else if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      toggleFullscreen();
    } else if (event.key === "Escape" && !overviewPanel.hidden) {
      event.preventDefault();
      closeOverview();
    }
  }

  prevButton.addEventListener("click", previousSlide);
  nextButton.addEventListener("click", nextSlide);
  overviewToggle.addEventListener("click", toggleOverview);
  overviewClose.addEventListener("click", closeOverview);
  fullscreenButton.addEventListener("click", toggleFullscreen);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "Salir pantalla completa" : "Pantalla completa";
  });
  window.addEventListener("hashchange", () => {
    showSlide(getIndexFromHash(), false);
  });

  buildOverview();
  showSlide(current, !window.location.hash);
})();
