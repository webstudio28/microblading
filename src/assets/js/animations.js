(function () {
  "use strict";

  // No animations on mobile — remove the class so CSS never hides anything.
  if (window.innerWidth < 1024) {
    document.documentElement.classList.remove("js-anim-ready");
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.remove("js-anim-ready");
    return;
  }

  function boot() {
    if (typeof gsap === "undefined") {
      document.documentElement.classList.remove("js-anim-ready");
      return;
    }

    var hasScrollTrigger = typeof ScrollTrigger !== "undefined";
    if (hasScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
    }

    // Fire when the element is already 30% into the viewport from the bottom —
    // user can clearly see the content when the animation starts.
    var SCROLL_START = "top 70%";

    function scrollConfig(triggerEl, overrides) {
      return Object.assign(
        {
          trigger: triggerEl,
          start: SCROLL_START,
          once: true,
          invalidateOnRefresh: true,
        },
        overrides || {}
      );
    }

    // Reveal immediately only if the element top is already above the trigger
    // threshold (top 70% of viewport). Anything below that waits for scroll.
    function isAlreadyInView(el) {
      if (!el || !el.getBoundingClientRect) return false;
      var rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.top < window.innerHeight * 0.7;
    }

    function revealNow(targets) {
      gsap.set(targets, { opacity: 1, y: 0, x: 0, scale: 1, clearProps: "transform,opacity,scale" });
    }

    function animateOnScroll(targets, fromVars, toVars, triggerEl, overrides) {
      targets = gsap.utils.toArray(targets).filter(function (el) {
        return el && el.isConnected;
      });
      if (!targets.length) return;

      var trigger = triggerEl || targets[0];

      if (!hasScrollTrigger) {
        revealNow(targets);
        return;
      }

      // Element is clearly visible at load — reveal without animation.
      if (isAlreadyInView(trigger)) {
        revealNow(targets);
        return;
      }

      gsap.fromTo(targets, fromVars, Object.assign({}, toVars, {
        immediateRender: false,
        scrollTrigger: scrollConfig(trigger, overrides),
      }));
    }

    function animateHeader(section) {
      var eyebrow = section.querySelector('[data-anim="eyebrow"]');
      var title   = section.querySelector('[data-anim="title"]');
      var lead    = section.querySelector('[data-anim="lead"]');
      var els = [eyebrow, title, lead].filter(Boolean);
      if (!els.length) return;

      animateOnScroll(
        els,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 1.35, stagger: 0.27, ease: "power3.out" },
        section
      );
    }

    // ── Microblading ──
    var mbSection = document.querySelector("#microblading");
    if (mbSection) {
      animateHeader(mbSection);
      var mbBubbles = mbSection.querySelectorAll('[data-anim="bubble"]');
      if (mbBubbles.length) {
        var mbBubblesWrap = mbSection.querySelector("[data-mb-bubbles-wrap]") || mbSection.querySelector("[data-mb-bubbles]");
        animateOnScroll(
          mbBubbles,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 1.65, stagger: 0.09, ease: "power2.out" },
          mbBubblesWrap || mbSection
        );
      }
    }

    // ── Lamination ──
    var lamSection = document.querySelector("#laminating");
    if (lamSection) {
      animateHeader(lamSection);
      var lamBubbles = lamSection.querySelectorAll('[data-anim="bubble"]');
      if (lamBubbles.length) {
        var lamBubblesWrap = lamSection.querySelector("[data-lam-bubbles-wrap]") || lamSection.querySelector("[data-lam-bubbles]");
        animateOnScroll(
          lamBubbles,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 1.65, stagger: 0.09, ease: "power2.out" },
          lamBubblesWrap || lamSection
        );
      }
    }

    // ── Procedure steps ──
    var procSection = document.querySelector("#procedure");
    if (procSection) {
      animateHeader(procSection);
      var steps = procSection.querySelectorAll('[data-anim="step"]');
      if (steps.length) {
        animateOnScroll(
          steps,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 1.28, stagger: 0.33, ease: "power3.out" },
          procSection
        );
      }
    }

    // ── Before / after ──
    var clientsSection = document.querySelector("#clients");
    if (clientsSection) {
      animateHeader(clientsSection);
    }

    // ── About ──
    var aboutSection = document.querySelector("#about");
    if (aboutSection) {
      var aboutTitle = aboutSection.querySelector('[data-anim="title"]');
      var aboutIntro = aboutSection.querySelector('[data-anim="about-intro"]');
      var aboutTitleEls = [aboutTitle, aboutIntro].filter(Boolean);
      if (aboutTitleEls.length) {
        animateOnScroll(
          aboutTitleEls,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 1.35, stagger: 0.27, ease: "power3.out" },
          aboutSection
        );
      }

      var photosWrap = aboutSection.querySelector(".about-section__photos");
      var aboutPhotos = aboutSection.querySelectorAll('[data-anim="about-photo"]');
      if (aboutPhotos.length) {
        animateOnScroll(
          aboutPhotos,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.35, stagger: 0.27, ease: "power3.out" },
          photosWrap || aboutSection
        );
      }

      var aboutBody = aboutSection.querySelector('[data-anim="about-body"]');
      if (aboutBody) {
        animateOnScroll(
          aboutBody,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 1.28, ease: "power3.out" },
          aboutBody
        );
      }

      var aboutCta = aboutSection.querySelector('[data-anim="about-cta"]');
      if (aboutCta) {
        animateOnScroll(
          aboutCta,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.05, ease: "power2.out" },
          aboutCta
        );
      }
    }

    // ── Testimonials ──
    var testimonialsSection = document.querySelector("#testimonials");
    if (testimonialsSection) {
      animateHeader(testimonialsSection);
    }

    // ── FAQ ──
    var faqSection = document.querySelector("#faq");
    if (faqSection) {
      animateHeader(faqSection);
      var faqItems = faqSection.querySelectorAll('[data-anim="faq-item"]');
      if (faqItems.length) {
        animateOnScroll(
          faqItems,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 1.13, stagger: 0.15, ease: "power2.out" },
          faqSection
        );
      }
    }

    // ── Contact ──
    var contactSection = document.querySelector("#contact");
    if (contactSection) {
      animateHeader(contactSection);
    }

    if (hasScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }

  function scheduleBoot() {
    requestAnimationFrame(function () {
      requestAnimationFrame(boot);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleBoot);
  } else {
    scheduleBoot();
  }

  window.addEventListener("load", function () {
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    });
  }
})();
