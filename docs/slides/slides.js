/*
 * Código fuente publicado bajo licencia 0BSD.
 * Contenido docente original asociado publicado bajo CC0 1.0 Universal.
 * Véanse LICENSE-0BSD, LICENSE-CC0 y LICENSES.md.
 */

(() => {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const counter = document.querySelector("#slide-counter");
  const title = document.querySelector("#slide-title");
  const progress = document.querySelector("#progress-bar");
  const prevButton = document.querySelector("#prev-slide");
  const nextButton = document.querySelector("#next-slide");
  const overviewToggle = document.querySelector("#overview-toggle");
  const fullscreenButton = document.querySelector("#fullscreen-button");
  const overviewPanel = document.querySelector("#overview-panel");
  const overviewList = document.querySelector("#overview-list");
  const stage = document.querySelector("#slide-stage");

  let current = getIndexFromHash();

  function getIndexFromHash() {
    const match = window.location.hash.match(/#\/?(\d+)/);
    if (!match) return 0;
    return clamp(Number(match[1]) - 1, 0, slides.length - 1);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function loadIframe(slide) {
    const iframe = slide.querySelector("iframe[data-src]");
    if (iframe && !iframe.src) {
      iframe.src = iframe.dataset.src;
    }
  }

  function renderForms() {
    document.querySelectorAll("[data-form-key]").forEach((slide) => {
      const key = slide.dataset.formKey;
      const target = slide.querySelector("[data-form-render]");
      const formsConfig = typeof FORMS !== "undefined" ? FORMS : {};
      const config = formsConfig[key] || {};
      if (!target) return;

      const titleText = config.title || "Actividad en Microsoft Forms";
      target.replaceChildren();

      const heading = document.createElement("h3");
      heading.textContent = titleText;
      target.append(heading);

      if (config.embedUrl) {
        const iframe = document.createElement("iframe");
        iframe.src = config.embedUrl;
        iframe.title = `Microsoft Forms: ${titleText}`;
        iframe.loading = "lazy";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        target.append(iframe);
      } else {
        const fallback = document.createElement("div");
        fallback.className = "form-fallback";

        const message = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = "Actividad disponible desde el aula virtual";
        const text = document.createElement("p");
        text.textContent = "Si el formulario no está incrustado, usa el enlace publicado en el aula virtual o continúa la discusión en clase.";
        message.append(strong, text);
        fallback.append(message);

        if (config.qr) {
          const qr = document.createElement("img");
          qr.className = "qr-image";
          qr.src = config.qr;
          qr.alt = `QR de ${titleText}`;
          fallback.append(qr);
        }

        target.append(fallback);
      }

      if (config.url) {
        const row = document.createElement("div");
        row.className = "button-row";
        const link = document.createElement("a");
        link.className = "primary-button";
        link.href = config.url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = "Abrir Forms";
        row.append(link);
        target.append(row);
      }
    });
  }

  function renderOverview() {
    overviewList.replaceChildren();
    slides.forEach((slide, index) => {
      const link = document.createElement("a");
      link.href = `#/${index + 1}`;
      if (index === current) link.setAttribute("aria-current", "true");
      const number = document.createElement("span");
      number.textContent = `Diapositiva ${index + 1}`;
      const label = document.createElement("strong");
      label.textContent = slide.dataset.title || `Diapositiva ${index + 1}`;
      link.append(number, label);
      link.addEventListener("click", () => {
        closeOverview();
      });
      overviewList.append(link);
    });
  }

  function showSlide(index, updateHash = true) {
    current = clamp(index, 0, slides.length - 1);
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
      if (active) {
        loadIframe(slide);
      }
    });

    counter.textContent = `${current + 1} / ${slides.length}`;
    title.textContent = slides[current].dataset.title || `Diapositiva ${current + 1}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    prevButton.disabled = current === 0;
    nextButton.disabled = current === slides.length - 1;

    renderOverview();

    if (updateHash) {
      history.replaceState(null, "", `#/${current + 1}`);
    }
  }

  function nextSlide() {
    showSlide(current + 1);
  }

  function previousSlide() {
    showSlide(current - 1);
  }

  function openOverview() {
    overviewPanel.hidden = false;
    overviewToggle.setAttribute("aria-pressed", "true");
    const currentLink = overviewList.querySelector('[aria-current="true"]');
    currentLink?.focus();
  }

  function closeOverview() {
    overviewPanel.hidden = true;
    overviewToggle.setAttribute("aria-pressed", "false");
    stage.focus({ preventScroll: true });
  }

  function toggleOverview() {
    if (overviewPanel.hidden) openOverview();
    else closeOverview();
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
      fullscreenButton.textContent = "Salir pantalla completa";
    } else {
      await document.exitFullscreen?.();
      fullscreenButton.textContent = "Pantalla completa";
    }
  }

  prevButton.addEventListener("click", previousSlide);
  nextButton.addEventListener("click", nextSlide);
  overviewToggle.addEventListener("click", toggleOverview);
  fullscreenButton.addEventListener("click", toggleFullscreen);

  document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "Salir pantalla completa" : "Pantalla completa";
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const editing = ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName);
    if (editing) return;

    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      nextSlide();
    }
    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      previousSlide();
    }
    if (event.key === "Home") {
      event.preventDefault();
      showSlide(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      showSlide(slides.length - 1);
    }
    if (event.key.toLowerCase() === "o") {
      event.preventDefault();
      toggleOverview();
    }
    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      toggleFullscreen();
    }
    if (event.key === "Escape" && !overviewPanel.hidden) {
      event.preventDefault();
      closeOverview();
    }
  });

  window.addEventListener("hashchange", () => {
    showSlide(getIndexFromHash(), false);
  });

  renderForms();
  showSlide(current, !window.location.hash);
})();
