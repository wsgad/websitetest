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
     BUILD FILTERS (FIRST CATEGORY ONLY)
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
      .map(
        ([key, label]) =>
          `<button class="filter-btn" data-filter=".${key}">${label}</button>`
      )
      .join("");

  /* ===============================
     BUILD GRID (STATIC ANCHORS — SAFE)
     =============================== */

  projects.forEach(p => {
    const cat = slug(p.categories[0]);

    const col = document.createElement("div");
    col.className = `col-lg-4 col-md-6 gallery-item ${cat}`;

    // ✅ FIX: add data-lg-thumb for EVERY image
    const anchors = p.images
      .map((img, i) =>
        i === 0
          ? `<a 
               href="${p.path + img}"
               data-lg-thumb="${p.path + img}"
             >
               <img src="${p.path + p.cover}" alt="${p.title}">
             </a>`
          : `<a 
               href="${p.path + img}"
               data-lg-thumb="${p.path + img}"
               class="d-none"
             ></a>`
      )
      .join("");

    col.innerHTML = `
      <div class="project-card">
        ${anchors}
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
     ISOTOPE
     =============================== */

  const iso = new Isotope(gridEl, {
    itemSelector: ".gallery-item",
    layoutMode: "fitRows"
  });

  imagesLoaded(gridEl, () => iso.layout());

  filtersEl.addEventListener("click", e => {
    if (!e.target.classList.contains("filter-btn")) return;

    filtersEl.querySelectorAll(".filter-btn").forEach(btn =>
      btn.classList.remove("active")
    );

    e.target.classList.add("active");
    iso.arrange({ filter: e.target.dataset.filter });
  });

  /* ===============================
     LIGHTGALLERY — v2 CORRECT
     EACH CARD = ITS OWN GALLERY
     =============================== */

  document.querySelectorAll(".project-card").forEach(card => {
    lightGallery(card, {
      selector: "a",
      plugins: [lgThumbnail, lgZoom], // ✅ REQUIRED
      thumbnail: true,
      zoom: true,
      counter: true,
      download: false
    });
  });
});