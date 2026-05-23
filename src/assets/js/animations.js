(function () {
  "use strict";

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

    // Fire only when the section top enters the viewport from below.
    // "top bottom" = fire the moment the element's top edge crosses the
    // bottom of the viewport — guarantees the user has actually scrolled to it.
    var SCROLL_START = "top bottom";

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

    // Only skip animation if the element is clearly on-screen (top third of
    // the viewport). Anything in the lower 65% waits for the scroll trigger.
    function isAlreadyInView(el) {
      if (!el || !el.getBoundingClientRect) return false;
      var rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.top < window.innerHeight * 0.35;
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
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.18, ease: "power3.out" },
        section
      );
    }

    // ── Microblading ──
    var mbSection = document.querySelector("#microblading");
    if (mbSection) {
      animateHeader(mbSection);
      var mbBubbles = mbSection.querySelectorAll('[data-anim="bubble"]');
      if (mbBubbles.length) {
        animateOnScroll(
          mbBubbles,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.08, ease: "power2.out" },
          mbSection.querySelector("[data-mb-bubbles]") || mbSection
        );
      }
    }

    // ── Lamination ──
    var lamSection = document.querySelector("#laminating");
    if (lamSection) {
      animateHeader(lamSection);
      var lamBubbles = lamSection.querySelectorAll('[data-anim="bubble"]');
      if (lamBubbles.length) {
        animateOnScroll(
          lamBubbles,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.08, ease: "power2.out" },
          lamSection.querySelector("[data-lam-bubbles]") || lamSection
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
          { opacity: 1, y: 0, duration: 0.85, stagger: 0.22, ease: "power3.out" },
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
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.18, ease: "power3.out" },
          aboutSection
        );
      }

      var photosWrap = aboutSection.querySelector(".about-section__photos");
      var aboutPhotos = aboutSection.querySelectorAll('[data-anim="about-photo"]');
      if (aboutPhotos.length) {
        animateOnScroll(
          aboutPhotos,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.18, ease: "power3.out" },
          photosWrap || aboutSection
        );
      }

      var aboutBody = aboutSection.querySelector('[data-anim="about-body"]');
      if (aboutBody) {
        animateOnScroll(
          aboutBody,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" },
          aboutBody
        );
      }

      var aboutCta = aboutSection.querySelector('[data-anim="about-cta"]');
      if (aboutCta) {
        animateOnScroll(
          aboutCta,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
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
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.1, ease: "power2.out" },
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
