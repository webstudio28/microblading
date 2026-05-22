(function () {
  function boot() {
    if (!window.initInfiniteStrip) return;

    document.querySelectorAll(".strip-desktop-only [data-clients-strip]").forEach(function (strip) {
      if (strip.dataset.infiniteStripInit) return;
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
