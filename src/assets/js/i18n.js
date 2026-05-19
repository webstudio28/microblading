(function () {
  var STORAGE_KEY = "valyamatovska-lang";
  var DEFAULT_LANG = "bg";

  function getNested(obj, path) {
    if (!obj || !path) return undefined;
    return path.split(".").reduce(function (current, key) {
      if (current == null) return undefined;
      return current[key];
    }, obj);
  }

  function getLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "bg") return stored;
    } catch (error) {
      /* ignore */
    }
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    if (lang !== "en" && lang !== "bg") return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      /* ignore */
    }
    document.documentElement.lang = lang;
    applyTranslations();
    updateToggleUI();
    document.dispatchEvent(
      new CustomEvent("valyamatovska:langchange", { detail: { lang: lang } })
    );
  }

  function rememberBgText(el) {
    if (!el.hasAttribute("data-i18n-bg")) {
      el.setAttribute("data-i18n-bg", el.textContent);
    }
  }

  function applyText(el, value) {
    if (value == null || value === "") return;
    rememberBgText(el);
    el.textContent = value;
  }

  function restoreBgText(el) {
    var bg = el.getAttribute("data-i18n-bg");
    if (bg != null) el.textContent = bg;
  }

  function applyAttributes(el, lang) {
    var en = window.__I18N__ && window.__I18N__.en;
    var spec = el.getAttribute("data-i18n-attr");
    if (!spec) return;

    spec.split(";").forEach(function (pair) {
      var parts = pair.split(":").map(function (s) {
        return s.trim();
      });
      if (parts.length < 2) return;
      var attr = parts[0];
      var key = parts.slice(1).join(":");
      var bgAttr = "data-i18n-bg-" + attr;

      if (lang === "bg") {
        var saved = el.getAttribute(bgAttr);
        if (saved != null) el.setAttribute(attr, saved);
        return;
      }

      var value = getNested(en, key);
      if (value == null) return;
      if (!el.hasAttribute(bgAttr)) {
        el.setAttribute(bgAttr, el.getAttribute(attr) || "");
      }
      el.setAttribute(attr, value);
    });
  }

  function applyTranslations() {
    var lang = getLang();
    var en = window.__I18N__ && window.__I18N__.en;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;

      if (lang === "bg") {
        restoreBgText(el);
        return;
      }

      applyText(el, getNested(en, key));
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      applyAttributes(el, lang);
    });

    var titleEl = document.querySelector("[data-i18n-title]");
    if (titleEl) {
      var titleKey = titleEl.getAttribute("data-i18n-title");
      if (lang === "en") {
        var titleEn = getNested(en, titleKey);
        if (titleEn) document.title = titleEn;
      } else {
        var titleBg = titleEl.getAttribute("data-i18n-title-bg");
        if (titleBg) document.title = titleBg;
      }
    }

    var descMeta = document.querySelector('meta[name="description"][data-i18n-desc]');
    if (descMeta) {
      var descKey = descMeta.getAttribute("data-i18n-desc");
      if (lang === "en") {
        var descEn = getNested(en, descKey);
        if (descEn) descMeta.setAttribute("content", descEn);
      } else {
        var descBg = descMeta.getAttribute("data-i18n-desc-bg");
        if (descBg) descMeta.setAttribute("content", descBg);
      }
    }
  }

  function updateToggleUI() {
    var lang = getLang();
    document.querySelectorAll("[data-lang-toggle]").forEach(function (root) {
      root.querySelectorAll("[data-lang]").forEach(function (btn) {
        var isActive = btn.getAttribute("data-lang") === lang;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    });
  }

  function bindToggle() {
    document.querySelectorAll("[data-lang-toggle]").forEach(function (root) {
      root.querySelectorAll("[data-lang]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          setLang(btn.getAttribute("data-lang"));
        });
      });
    });
  }

  window.ValyamatovskaI18n = {
    getLang: getLang,
    setLang: setLang,
    t: function (key) {
      if (getLang() === "bg") return undefined;
      return getNested(window.__I18N__ && window.__I18N__.en, key);
    },
    apply: applyTranslations,
  };

  bindToggle();
  updateToggleUI();
  applyTranslations();

  document.addEventListener("DOMContentLoaded", function () {
    applyTranslations();
    updateToggleUI();
  });
})();
