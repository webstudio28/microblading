(function initClientsStrips() {
  function boot() {
    document.querySelectorAll("[data-clients-wrap]").forEach(function (wrap) {
      var strip = wrap.querySelector("[data-clients-strip]");
      var setEl = strip ? strip.querySelector(".clients-strip-set") : null;
      if (!strip || !setEl) return;

      var setWidth = 0;
      var loopWidth = 0;
      var position = 0;
      var dragging = false;
      var touchPending = false;
      var startX = 0;
      var startY = 0;
      var startPos = 0;
      var speed = 0.15;
      var AXIS_LOCK_PX = 10;

      function getStripGap() {
        var cs = getComputedStyle(strip);
        return parseFloat(cs.columnGap || cs.gap || "0") || 0;
      }

      function ensureSetMinWidth() {
        var sets = strip.querySelectorAll(".clients-strip-set");
        if (!sets.length) return;

        var minSetWidth = strip.clientWidth + getStripGap() + 1;
        sets.forEach(function (set) {
          if (!set.dataset.baseHtml) {
            set.dataset.baseHtml = set.innerHTML;
          }
          set.innerHTML = set.dataset.baseHtml;

          var originals = Array.prototype.slice.call(set.children);
          if (!originals.length) return;

          var idx = 0;
          while (set.scrollWidth < minSetWidth && idx < 80) {
            set.appendChild(originals[idx % originals.length].cloneNode(true));
            idx += 1;
          }

          if (originals.length > 1) {
            var firstId = originals[0].getAttribute("data-client-id");
            var lastEl = set.lastElementChild;
            var lastId = lastEl ? lastEl.getAttribute("data-client-id") : null;
            if (firstId && lastId && firstId === lastId) {
              set.appendChild(originals[1].cloneNode(true));
            }
          }
        });
      }

      function refreshMeasurements() {
        setWidth = setEl.offsetWidth;
        loopWidth = setWidth + getStripGap();
      }

      function getClientX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
      }

      function getClientY(e) {
        return e.touches ? e.touches[0].clientY : e.clientY;
      }

      function tick() {
        if (!loopWidth) return;
        if (!dragging && !touchPending) {
          position -= speed;
          if (position < -loopWidth) position += loopWidth;
          if (position > 0) position -= loopWidth;
        }
        strip.style.transform = "translateX(" + position + "px)";
        requestAnimationFrame(tick);
      }

      function onDown(e) {
        if (e.target.closest("[data-client-trigger]")) return;
        if (typeof e.button === "number" && e.button !== 0 && !e.touches) return;

        startX = getClientX(e);
        startY = getClientY(e);
        startPos = position;

        if (e.touches) {
          touchPending = true;
          dragging = false;
          return;
        }

        if (e.cancelable) e.preventDefault();
        dragging = true;
        strip.classList.add("is-dragging");
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
          strip.classList.add("is-dragging");
        }

        if (!dragging) return;
        position = startPos + (getClientX(e) - startX);
      }

      function onUp() {
        touchPending = false;
        dragging = false;
        strip.classList.remove("is-dragging");
        strip.style.cursor = "";
        while (position < -loopWidth) position += loopWidth;
        while (position > 0) position -= loopWidth;
      }

      ensureSetMinWidth();
      refreshMeasurements();
      strip.style.willChange = "transform";
      strip.addEventListener("dragstart", function (e) {
        e.preventDefault();
      });
      strip.addEventListener("mousedown", onDown);
      strip.addEventListener("touchstart", onDown, { passive: true });
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchend", onUp);
      window.addEventListener("touchcancel", onUp);

      if (loopWidth > 0) {
        requestAnimationFrame(tick);
      } else {
        window.addEventListener(
          "load",
          function () {
            refreshMeasurements();
            requestAnimationFrame(tick);
          },
          { once: true }
        );
      }

      // Only re-measure when the viewport WIDTH changes (not height).
      // On iOS the virtual keyboard and URL bar cause height-only resize
      // events which would otherwise reset innerHTML and cause a visual flash.
      var lastResizeWidth = window.innerWidth;
      window.addEventListener("resize", function () {
        var newWidth = window.innerWidth;
        if (newWidth === lastResizeWidth) return;
        lastResizeWidth = newWidth;
        ensureSetMinWidth();
        refreshMeasurements();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
