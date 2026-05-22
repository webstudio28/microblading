(function () {
  function bootStrips() {
    if (!window.initInfiniteStrip) return;

    document.querySelectorAll(".strip-desktop-only .testimonials-strip").forEach(function (strip) {
      if (strip.dataset.infiniteStripInit) return;
      strip.dataset.infiniteStripInit = "1";
      window.initInfiniteStrip({
        speed: 0.15,
        strip: strip,
        setSelector: ".testimonials-strip-set",
        interactiveSelector: "[data-testimonial-open]",
      });
    });
  }

  var data = window.ValyamatovskaTestimonialsData;
  var previousFocus = null;
  var modalCloseWired = false;

  function getModalEls() {
    return {
      modal: document.getElementById("testimonial-read-modal"),
      name: document.getElementById("testimonial-modal-name"),
      quote: document.getElementById("testimonial-modal-quote"),
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
    var enItems =
      window.__I18N__ &&
      window.__I18N__.en &&
      window.__I18N__.en.home &&
      window.__I18N__.en.home.testimonials &&
      window.__I18N__.en.home.testimonials.items;
    var enIndex = item.sourceIndex !== undefined ? item.sourceIndex : index;
    var enItem = lang === "en" && enItems && enItems[enIndex] ? enItems[enIndex] : null;
    els.name.textContent = enItem && enItem.name ? enItem.name : item.name || "";
    els.quote.textContent = enItem && enItem.quote ? enItem.quote : item.quote || "";
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
    bootStrips();
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
  document.addEventListener("valyamatovska:langchange", updateExpandButtons);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateExpandButtons).catch(updateExpandButtons);
  }
})();
