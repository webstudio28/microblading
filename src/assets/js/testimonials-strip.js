(function () {
  var strip = document.querySelector(".testimonials-strip");
  var setEl = strip ? strip.querySelector(".testimonials-strip-set") : null;
  var setWidth = 0;
  var position = 0;
  var dragging = false;
  var touchPending = false;
  var startX = 0;
  var startY = 0;
  var startPos = 0;
  var speed = 0.15;
  var AXIS_LOCK_PX = 10;

  function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function getClientY(e) {
    return e.touches ? e.touches[0].clientY : e.clientY;
  }

  function tick() {
    if (!strip || !setWidth) return;
    if (!dragging && !touchPending) {
      position -= speed;
      if (position < -setWidth) position += setWidth;
      if (position > 0) position -= setWidth;
    }
    strip.style.transform = "translateX(" + position + "px)";
    requestAnimationFrame(tick);
  }

  function onDown(e) {
    if (e.target.closest("[data-testimonial-open]")) return;
    if (typeof e.button === "number" && e.button !== 0 && !e.touches) return;

    startX = getClientX(e);
    startY = getClientY(e);
    startPos = position;

    if (e.touches) {
      touchPending = true;
      dragging = false;
      return;
    }

    dragging = true;
    strip.style.cursor = "grabbing";
  }

  function onMove(e) {
    if (touchPending && !dragging) {
      var x = getClientX(e);
      var y = getClientY(e);
      var dx = Math.abs(x - startX);
      var dy = Math.abs(y - startY);
      if (dx < AXIS_LOCK_PX && dy < AXIS_LOCK_PX) return;
      if (dy >= dx) {
        touchPending = false;
        return;
      }
      touchPending = false;
      dragging = true;
      strip.style.cursor = "grabbing";
    }

    if (!dragging) return;
    var moveX = getClientX(e);
    position = startPos + (moveX - startX);
  }

  function onUp() {
    touchPending = false;
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
    window.addEventListener("touchcancel", onUp);

    if (setWidth > 0) requestAnimationFrame(tick);
    else
      window.addEventListener("load", function () {
        setWidth = setEl.offsetWidth;
        requestAnimationFrame(tick);
      });
  }

  var data = window.ValyamatovskaTestimonialsData;
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
    var lang = window.ValyamatovskaI18n ? window.ValyamatovskaI18n.getLang() : "bg";
    var enItems = window.__I18N__ && window.__I18N__.en && window.__I18N__.en.home && window.__I18N__.en.home.testimonials && window.__I18N__.en.home.testimonials.items;
    var enIndex = (item.sourceIndex !== undefined) ? item.sourceIndex : index;
    var enItem = (lang === "en" && enItems && enItems[enIndex]) ? enItems[enIndex] : null;
    els.name.textContent = (enItem && enItem.name) ? enItem.name : (item.name || "");
    els.quote.textContent = (enItem && enItem.quote) ? enItem.quote : (item.quote || "");
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
