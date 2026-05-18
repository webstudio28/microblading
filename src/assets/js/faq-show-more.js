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

  function measureFullHeight(inner) {
    var prev = inner.style.maxHeight;
    inner.style.maxHeight = "none";
    var h = inner.scrollHeight;
    inner.style.maxHeight = prev;
    return h;
  }

  function onHeightTransitionEnd(inner, extra, cb) {
    function onEnd(e) {
      if (e.target !== inner || e.propertyName !== "max-height") return;
      inner.removeEventListener("transitionend", onEnd);
      cb();
    }
    inner.addEventListener("transitionend", onEnd);
  }

  function collapseExtra(extra, inner, opts) {
    opts = opts || {};
    extra.classList.remove("is-expanded");

    if (opts.instant || reducedMotion) {
      inner.style.maxHeight = "";
      return;
    }

    var full = measureFullHeight(inner);
    inner.style.maxHeight = full + "px";
    inner.getBoundingClientRect();
    inner.style.maxHeight = COLLAPSED_PEEK;

    onHeightTransitionEnd(inner, extra, function () {
      if (!extra.classList.contains("is-expanded")) {
        inner.style.maxHeight = "";
      }
    });
  }

  function expandExtra(extra, inner) {
    extra.classList.add("is-expanded");

    if (reducedMotion) {
      inner.style.maxHeight = "";
      return;
    }

    var full = measureFullHeight(inner);
    inner.style.maxHeight = COLLAPSED_PEEK;
    inner.getBoundingClientRect();
    inner.style.maxHeight = full + "px";

    onHeightTransitionEnd(inner, extra, function () {
      if (extra.classList.contains("is-expanded")) {
        inner.style.maxHeight = "";
      }
    });
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
    });
  }

  function bindBlock(block) {
    var extra = block.querySelector("[data-faq-extra]");
    var btn = block.querySelector("[data-faq-expand]");
    if (!extra || !btn || btn.dataset.faqExpandBound) return;

    var inner = extra.querySelector("[data-faq-extra-inner]");
    if (!inner) return;

    btn.dataset.faqExpandBound = "1";
    inner.style.maxHeight = "";
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("valeto:langchange", function () {
    var listRoot = root.querySelector("[data-faq-list]");
    if (!listRoot) return;
    var extra = listRoot.querySelector("[data-faq-extra]");
    var btn = listRoot.querySelector("[data-faq-expand]");
    var inner = extra && extra.querySelector("[data-faq-extra-inner]");
    if (!extra || !inner || !btn) return;
    var expanded = extra.classList.contains("is-expanded");
    if (!expanded) {
      inner.style.maxHeight = "";
    }
    setButtonState(btn, expanded);
  });
})();
