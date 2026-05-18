(function () {
  var root = document.querySelector("[data-faq]");
  if (!root) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COLLAPSED_PEEK = "5.25rem";

  function uiLabels() {
    var lang = document.documentElement.lang || "bg";
    if (
      lang === "en" &&
      window.__I18N__ &&
      window.__I18N__.en &&
      window.__I18N__.en.ui
    ) {
      var u = window.__I18N__.en.ui;
      return {
        more: u.faqSeeMore || u.seeMore || "See more",
        less: u.faqSeeLess || "See less",
      };
    }
    return { more: "Виж още", less: "По-малко" };
  }

  /**
   * @param {HTMLElement} extra
   * @param {HTMLElement} inner
   * @param {{ instant?: boolean }} [opts]
   */
  function collapseExtra(extra, inner, opts) {
    opts = opts || {};
    extra.classList.remove("is-expanded");
    if (opts.instant || reducedMotion) {
      inner.style.maxHeight = COLLAPSED_PEEK;
      return;
    }
    var h = inner.scrollHeight;
    inner.style.maxHeight = h + "px";
    inner.getBoundingClientRect();
    inner.style.maxHeight = COLLAPSED_PEEK;
  }

  function expandExtra(extra, inner) {
    extra.classList.add("is-expanded");
    if (reducedMotion) {
      inner.style.maxHeight = "";
      return;
    }
    var target = inner.scrollHeight;
    inner.style.maxHeight = target + "px";
    inner.addEventListener(
      "transitionend",
      function onEnd(e) {
        if (e.propertyName !== "max-height" || !extra.classList.contains("is-expanded")) return;
        inner.style.maxHeight = "";
      },
      { once: true }
    );
  }

  function setButtonState(btn, expanded) {
    var label = btn.querySelector("[data-faq-expand-label]");
    var L = uiLabels();
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    if (label) {
      label.textContent = expanded ? L.less : L.more;
    }
  }

  function closeOpenInExtra(extra) {
    extra.querySelectorAll("details.faq-details[open]").forEach(function (d) {
      d.open = false;
      var panel = d.querySelector(".faq-details__content");
      if (panel) {
        panel.style.height = "";
        panel.style.transition = "";
      }
    });
  }

  function bindBlock(block) {
    var extra = block.querySelector("[data-faq-extra]");
    var btn = block.querySelector("[data-faq-expand]");
    if (!extra || !btn || btn.dataset.faqExpandBound) return;

    var inner = extra.querySelector("[data-faq-extra-inner]");
    if (!inner) return;

    btn.dataset.faqExpandBound = "1";
    collapseExtra(extra, inner, { instant: true });
    setButtonState(btn, false);

    btn.addEventListener("click", function () {
      var expanded = extra.classList.contains("is-expanded");
      if (expanded) {
        closeOpenInExtra(extra);
        collapseExtra(extra, inner);
        setButtonState(btn, false);
      } else {
        expandExtra(extra, inner);
        setButtonState(btn, true);
      }
    });
  }

  function init() {
    var listRoot = root.querySelector("[data-faq-list]");
    if (listRoot) bindBlock(listRoot);
  }

  init();

  document.addEventListener("valeto:langchange", function () {
    var listRoot = root.querySelector("[data-faq-list]");
    if (!listRoot) return;
    var extra = listRoot.querySelector("[data-faq-extra]");
    var btn = listRoot.querySelector("[data-faq-expand]");
    var inner = extra && extra.querySelector("[data-faq-extra-inner]");
    if (!extra || !inner || !btn) return;
    var expanded = extra.classList.contains("is-expanded");
    if (!expanded) {
      collapseExtra(extra, inner, { instant: true });
    }
    setButtonState(btn, expanded);
  });
})();
