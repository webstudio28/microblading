(function () {
  /**
   * Infinite horizontal strip: auto-scroll + drag with release momentum.
   * @param {{
   *   speed: number,
   *   setSelector: string,
   *   strip?: Element,
   *   getActiveStrip?: function(): Element|null,
   *   interactiveSelector?: string
   * }} options
   */
  window.initInfiniteStrip = function (options) {
    var speed = options.speed;
    var setSelector = options.setSelector;
    var fixedStrip = options.strip || null;
    var getActiveStrip = options.getActiveStrip;
    var interactiveSelector = options.interactiveSelector || null;

    var position = 0;
    var dragging = false;
    var startX = 0;
    var startPos = 0;
    var momentumVel = 0;
    var velocityEstimate = 0;
    var lastSampleX = 0;
    var lastSampleTime = 0;
    var strip = null;
    var setEl = null;
    var setWidth = 0;
    var rafId = null;
    var lastFrameTime = 0;
    var lastResizeWidth = window.innerWidth;

    var FRICTION = 0.95;
    var MIN_VELOCITY = 0.012;
    var MAX_VELOCITY = 2.5;

    function resolveStrip() {
      return fixedStrip || (getActiveStrip ? getActiveStrip() : null);
    }

    function getClientX(e) {
      return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function wrapPosition() {
      if (setWidth <= 0) return;
      while (position < -setWidth) position += setWidth;
      while (position > 0) position -= setWidth;
    }

    function refreshMeasurements() {
      if (!setEl) return;
      setWidth = setEl.offsetWidth;
      wrapPosition();
    }

    function tick(now) {
      var t = now || performance.now();
      var dt = lastFrameTime ? Math.min(t - lastFrameTime, 50) : 16;
      lastFrameTime = t;

      if (!dragging && strip) {
        if (Math.abs(momentumVel) > MIN_VELOCITY) {
          position += momentumVel * dt;
          momentumVel *= Math.pow(FRICTION, dt / 16);
        } else {
          momentumVel = 0;
          position -= speed;
        }
        wrapPosition();
      }

      if (strip) strip.style.transform = "translateX(" + position + "px)";
      rafId = requestAnimationFrame(tick);
    }

    function sampleVelocity(x) {
      var now = performance.now();
      if (lastSampleTime > 0) {
        var dt = now - lastSampleTime;
        if (dt > 0 && dt < 120) {
          var instant = (x - lastSampleX) / dt;
          velocityEstimate = velocityEstimate * 0.5 + instant * 0.5;
        }
      }
      lastSampleX = x;
      lastSampleTime = now;
    }

    function isInteractiveTarget(target) {
      if (!target || !target.closest) return false;
      if (interactiveSelector && target.closest(interactiveSelector)) return true;
      return !!target.closest("button, a, input, textarea, select, [role='button']");
    }

    function onDown(e) {
      if (!strip || strip !== resolveStrip()) return;
      if (e.button !== undefined && e.button !== 0) return;
      if (isInteractiveTarget(e.target)) return;
      dragging = true;
      momentumVel = 0;
      velocityEstimate = 0;
      startX = getClientX(e);
      startPos = position;
      lastSampleX = startX;
      lastSampleTime = performance.now();
      strip.style.cursor = "grabbing";
      if (e.cancelable) e.preventDefault();
    }

    function onMove(e) {
      if (!dragging || !strip) return;
      if (e.cancelable) e.preventDefault();
      var x = getClientX(e);
      sampleVelocity(x);
      position = startPos + (x - startX);
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      if (strip) strip.style.cursor = "grab";
      momentumVel = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocityEstimate));
      wrapPosition();
    }

    function preventDrag(e) {
      e.preventDefault();
    }

    function attachToStrip(newStrip) {
      if (!newStrip || newStrip === strip) return;

      if (strip) {
        strip.removeEventListener("mousedown", onDown);
        strip.removeEventListener("touchstart", onDown);
        strip.removeEventListener("dragstart", preventDrag);
      }

      strip = newStrip;
      setEl = strip.querySelector(setSelector);
      setWidth = setEl ? setEl.offsetWidth : 0;

      strip.style.cursor = "grab";
      strip.style.willChange = "transform";
      position = 0;
      momentumVel = 0;

      strip.addEventListener("dragstart", preventDrag);
      strip.addEventListener("mousedown", onDown);
      strip.addEventListener("touchstart", onDown, { passive: false });
    }

    function init() {
      var active = resolveStrip();
      if (!active) return;
      attachToStrip(active);
      // Always re-measure after full page load — iOS Safari may not have
      // resolved image/font dimensions yet at DOMContentLoaded.
      window.addEventListener(
        "load",
        function () {
          refreshMeasurements();
        },
        { once: true }
      );
      // Re-measure after webfonts settle (affects card widths for text strips).
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          refreshMeasurements();
        });
      }
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchcancel", onUp);

    window.addEventListener("resize", function () {
      var newWidth = window.innerWidth;
      if (newWidth === lastResizeWidth) return;
      lastResizeWidth = newWidth;
      refreshMeasurements();
    });

    document.addEventListener("valyamatovska:langchange", refreshMeasurements);

    init();
    if (!rafId) rafId = requestAnimationFrame(tick);
  };
})();
