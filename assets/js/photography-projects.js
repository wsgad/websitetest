document.addEventListener("DOMContentLoaded", async () => {
  const filtersEl = document.querySelector(".gallery-filters");
  const gridEl = document.querySelector(".gallery-container");

  if (!filtersEl || !gridEl) return;

  /* ===============================
     LOAD DATA
     =============================== */

  const res = await fetch("assets/img/photography/gallery.json");
  const data = await res.json();
  const projects = data.projects || [];

  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  /* ===============================
     BUILD FILTERS
     =============================== */

  const filterMap = new Map();
  projects.forEach(p => {
    if (p.categories?.length) {
      filterMap.set(slug(p.categories[0]), p.categories[0]);
    }
  });

  filtersEl.innerHTML =
    `<button class="filter-btn active" data-filter="*">All</button>` +
    [...filterMap.entries()]
      .map(([k, v]) => `<button class="filter-btn" data-filter=".${k}">${v}</button>`)
      .join("");

  /* ===============================
     BUILD GRID — CORRECT LG v2 STRUCTURE
     =============================== */

  projects.forEach(p => {
    const cat = slug(p.categories[0]);
    const col = document.createElement("div");
    col.className = `col-lg-4 col-md-6 gallery-item ${cat}`;

    /* ✅ REAL LightGallery anchors (FIRST image = FIRST thumbnail) */
    const galleryAnchors = p.images
      .map(
        img => `
          <a href="${p.path + img}">
            <img
              src="${p.path + img}"
              alt="${p.title}"
              class="d-none"
              loading="lazy"
              decoding="async"
            >
          </a>
        `
      )
      .join("");

    /* ✅ COVER IMAGE (NOT part of LightGallery) */
    const coverImage = `
      <img
        src="${p.path + p.cover}"
        alt="${p.title}"
        class="project-cover"
        loading="lazy"
        decoding="async"
      >
    `;

    col.innerHTML = `
      <div class="project-card">
        ${coverImage}
        <div class="lg-items">
          ${galleryAnchors}
        </div>
        <div class="project-overlay">
          <div>
            <div class="project-title">${p.title}</div>
            <div class="project-categories">${p.allCategories.join(" / ")}</div>
          </div>
        </div>
      </div>
    `;

    gridEl.appendChild(col);
  });

  /* ===============================
     ISOTOPE — MASONRY
     =============================== */

  const iso = new Isotope(gridEl, {
    itemSelector: ".gallery-item",
    layoutMode: "masonry",
    percentPosition: true,
    masonry: { columnWidth: ".gallery-item" },
    transitionDuration: "0.6s"
  });

  imagesLoaded(gridEl, () => iso.layout());

  filtersEl.addEventListener("click", e => {
    if (!e.target.classList.contains("filter-btn")) return;
    filtersEl.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    iso.arrange({ filter: e.target.dataset.filter });
  });

  /* ===============================
     LIGHTGALLERY — v2 (FINAL)
     =============================== */

  document.querySelectorAll(".project-card").forEach(card => {
    const gallery = card.querySelector(".lg-items");
    lightGallery(gallery, {
      selector: "a",
      plugins: [lgThumbnail, lgZoom],
      thumbnail: true,
      zoom: false,
      counter: true,
      download: false
    });

    // Clicking cover opens gallery at first image
    const cover = card.querySelector(".project-cover");
    cover.addEventListener("click", () => {
      gallery.querySelector("a")?.click();
    });
  });
});