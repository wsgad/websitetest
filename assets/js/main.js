
/**
 * GLOBAL JS — CLEANED & AUDITED
 * - Single gallery logic (LightGallery ONLY)
 * - No GLightbox
 * - Guarded initializations
 * - Safe header injection
 */

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("site-header");
  if (mount) {
    fetch("assets/partials/header.html")
      .then(r => r.text())
      .then(html => {
        mount.innerHTML = html;
        if (typeof window.initNavMenu === "function") {
          window.initNavMenu();
        }
      })
      .catch(e => console.error("Global header load failed:", e));
  }
});

(function () {
  "use strict";

  function toggleScrolled() {
    const body = document.body;
    const header = document.querySelector("#header");
    if (!header) return;
    if (
      !header.classList.contains("scroll-up-sticky") &&
      !header.classList.contains("sticky-top") &&
      !header.classList.contains("fixed-top")
    ) return;

    window.scrollY > 100
      ? body.classList.add("scrolled")
      : body.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);
  window.addEventListener("load", toggleScrolled);

  function mobileNavToggle() {
    document.body.classList.toggle("mobile-nav-active");
    const btn = document.querySelector(".mobile-nav-toggle");
    if (btn) {
      btn.classList.toggle("bi-list");
      btn.classList.toggle("bi-x");
    }
  }

  function isMobile() {
    return window.matchMedia("(max-width: 1199px)").matches;
  }

  window.initNavMenu = function () {
    const toggleBtn = document.querySelector(".mobile-nav-toggle");
    if (toggleBtn && !toggleBtn.dataset.navInit) {
      toggleBtn.addEventListener("click", mobileNavToggle);
      toggleBtn.dataset.navInit = "true";
    }

    document.querySelectorAll("#navmenu a").forEach(link => {
      if (link.dataset.navInit) return;
      link.addEventListener("click", () => {
        if (document.body.classList.contains("mobile-nav-active")) {
          mobileNavToggle();
        }
      });
      link.dataset.navInit = "true";
    });

    document.querySelectorAll("#navmenu li.dropdown > a").forEach(anchor => {
      if (anchor.dataset.navInit) return;
      anchor.addEventListener("click", e => {
        if (!isMobile()) return;
        e.preventDefault();
        anchor.parentNode.classList.toggle("active");
        const submenu = anchor.nextElementSibling;
        if (submenu) submenu.classList.toggle("dropdown-active");
      });
      anchor.dataset.navInit = "true";
    });
  };

  window.addEventListener("load", () => {
    if (typeof window.initNavMenu === "function") window.initNavMenu();
  });

  const preloader = document.querySelector("#preloader");
  if (preloader) {
    window.addEventListener("load", () => preloader.remove());
  }

  const scrollTop = document.querySelector(".scroll-top");
  if (scrollTop) {
    scrollTop.addEventListener("click", e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const toggleScrollTop = () => {
      window.scrollY > 100
        ? scrollTop.classList.add("active")
        : scrollTop.classList.remove("active");
    };

    window.addEventListener("load", toggleScrollTop);
    document.addEventListener("scroll", toggleScrollTop);
  }

  window.addEventListener("load", () => {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 600,
        easing: "ease-in-out",
        once: true,
        mirror: false
      });
    }
  });

  const typedEl = document.querySelector(".typed");
  if (typedEl && typeof Typed !== "undefined") {
    const strings = typedEl
      .getAttribute("data-typed-items")
      .split(",");
    new Typed(".typed", {
      strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  if (typeof PureCounter !== "undefined") {
    new PureCounter();
  }

  window.addEventListener("load", () => {
    if (typeof Swiper === "undefined") return;
    document.querySelectorAll(".init-swiper").forEach(el => {
      const cfg = el.querySelector(".swiper-config");
      if (!cfg) return;
      const config = JSON.parse(cfg.innerHTML.trim());
      new Swiper(el, config);
    });
  });

  if (typeof Isotope !== "undefined" && typeof imagesLoaded !== "undefined") {
    document.querySelectorAll(".isotope-layout").forEach(layout => {
      const container = layout.querySelector(".isotope-container");
      if (!container) return;

      imagesLoaded(container, () => {
        const iso = new Isotope(container, {
          itemSelector: ".isotope-item",
          layoutMode: layout.dataset.layout || "masonry"
        });

        layout.querySelectorAll(".isotope-filters li").forEach(btn => {
          btn.addEventListener("click", () => {
            layout
              .querySelector(".filter-active")
              ?.classList.remove("filter-active");
            btn.classList.add("filter-active");
            iso.arrange({ filter: btn.dataset.filter });
          });
        });
      });
    });
  }

  // ❌ GLightbox REMOVED

})();
