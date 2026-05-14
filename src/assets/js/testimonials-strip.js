(function () {
  var strip = document.querySelector(".testimonials-strip");
  var setEl = strip ? strip.querySelector(".testimonials-strip-set") : null;
  var setWidth = 0;
  var position = 0;
  var dragging = false;
  var startX = 0;
  var startPos = 0;
  var speed = 0.15;

  function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function tick() {
    if (!strip || !setWidth) return;
    if (!dragging) {
      position -= speed;
      if (position < -setWidth) position += setWidth;
      if (position > 0) position -= setWidth;
    }
    strip.style.transform = "translateX(" + position + "px)";
    requestAnimationFrame(tick);
  }

  function onDown(e) {
    if (e.target.closest("[data-testimonial-open]")) return;
    if (typeof e.button === "number" && e.button !== 0) return;
    dragging = true;
    startX = getClientX(e);
    startPos = position;
    strip.style.cursor = "grabbing";
  }

  function onMove(e) {
    if (!dragging) return;
    var x = getClientX(e);
    position = startPos + (x - startX);
  }

  function onUp() {
    dragging = false;
    if (!strip || !setWidth) return;
    strip.style.cursor = "grab";
    while (position < -setWidth) position += setWidth;
    while (position > 0) position -= setWidth;
  }

  if (strip && setEl) {
    setWidth = setEl.offsetWidth;
    strip.style.cursor = "grab";
    strip.style.willChange = "transform";
    strip.addEventListener("mousedown", onDown);
    strip.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    if (setWidth > 0) requestAnimationFrame(tick);
    else
      window.addEventListener("load", function () {
        setWidth = setEl.offsetWidth;
        requestAnimationFrame(tick);
      });
  }

  var data = window.ValetoTestimonialsData;
  var previousFocus = null;
  var modalCloseWired = false;

  function getModalEls() {
    return {
      modal: document.getElementById("testimonial-read-modal"),
      name: document.getElementById("testimonial-modal-name"),
      quote: document.getElementById("testimonial-modal-quote")
    };
  }

  function updateExpandButtons() {
    document.querySelectorAll(".testimonial-card").forEach(function (card) {
      var quote = card.querySelector(".testimonial-card__quote");
      var btn = card.querySelector("[data-testimonial-open]");
      if (!quote || !btn) return;
      var overflow = quote.scrollHeight - quote.clientHeight > 2;
      btn.hidden = !overflow;
    });
  }

  function openModal(index) {
    var els = getModalEls();
    if (!els.modal || !els.name || !els.quote || !data || !data[index]) return;
    var item = data[index];
    els.name.textContent = item.name || "";
    els.quote.textContent = item.quote || "";
    previousFocus = document.activeElement;
    els.modal.hidden = false;
    els.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    var panel = els.modal.querySelector(".testimonial-modal__panel");
    if (panel && typeof panel.focus === "function") {
      panel.focus();
    }
  }

  function closeModal() {
    var els = getModalEls();
    if (!els.modal) return;
    els.modal.hidden = true;
    els.modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-testimonial-open]");
    if (!opener) return;
    e.preventDefault();
    e.stopPropagation();
    var idx = parseInt(opener.getAttribute("data-testimonial-index"), 10);
    if (!isNaN(idx)) openModal(idx);
  });

  function wireModalCloseOnce() {
    if (modalCloseWired) return;
    var els = getModalEls();
    if (!els.modal) return;
    modalCloseWired = true;
    els.modal.querySelectorAll("[data-testimonial-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var els = getModalEls();
    if (!els.modal || els.modal.hidden) return;
    closeModal();
  });

  function onReady() {
    wireModalCloseOnce();
    updateExpandButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  window.addEventListener("load", updateExpandButtons);
  window.addEventListener("resize", updateExpandButtons);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateExpandButtons).catch(updateExpandButtons);
  }
})();
