(function () {
  var DESKTOP_MQ = "(min-width: 768px)";

  function resetStripInlineStyles(strip) {
    strip.style.removeProperty("transform");
    strip.style.removeProperty("will-change");
    strip.style.removeProperty("cursor");
    strip.classList.remove("strip-native-scroll");
    var wrap = strip.closest(".clients-strip-wrapper");
    if (wrap) wrap.classList.remove("strip-native-scroll");
  }

  function enableNativeScroll(strip) {
    strip.classList.add("strip-native-scroll");
    var wrap = strip.closest(".clients-strip-wrapper");
    if (wrap) wrap.classList.add("strip-native-scroll");
  }

  function boot() {
    document.querySelectorAll("[data-clients-strip]").forEach(function (strip) {
      resetStripInlineStyles(strip);
      if (!window.matchMedia(DESKTOP_MQ).matches) {
        enableNativeScroll(strip);
        return;
      }
      if (!window.initInfiniteStrip || strip.dataset.infiniteStripInit) return;
      strip.dataset.infiniteStripInit = "1";
      window.initInfiniteStrip({
        speed: 0.15,
        strip: strip,
        setSelector: ".clients-strip-set",
        interactiveSelector: "[data-client-trigger]",
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
