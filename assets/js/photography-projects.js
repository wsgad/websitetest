document.addEventListener("DOMContentLoaded", async () => {
  const filtersContainer = document.querySelector(".gallery-filters");
  const galleryContainer = document.querySelector(".gallery-container");

  if (!filtersContainer || !galleryContainer) return;

  /* -------------------------------------
     HELPERS
  ------------------------------------- */
  const slugify = str =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

  /* -------------------------------------
     LOAD gallery.json
  ------------------------------------- */
  let data;
  try {
    const res = await fetch("assets/img/photography/gallery.json");
    data = await res.json();
  } catch (err) {
    console.error("❌ Failed to load gallery.json", err);
    return;
  }

  const projects = data.projects || [];
  if (!projects.length) return;

  /* -------------------------------------
     BUILD FILTERS
     - FIRST CATEGORY ONLY
     - LABEL = original text (Food & Beverage)
     - SLUG  = safe CSS class (food-beverage)
  ------------------------------------- */
  const filterMap = new Map(); // slug -> label

  projects.forEach(project => {
    if (project.categories && project.categories[0]) {
      const label = project.categories[0]; // EXACT text from meta
      const slug = slugify(label);
      filterMap.set(slug, label);
    }
  });

  filtersContainer.innerHTML = `
    <button class="filter-btn active" data-filter="*">All</button>
    ${[...filterMap.entries()]
      .map(
        ([slug, label]) =>
          `<button class="filter-btn" data-filter=".${slug}">${label}</button>`
      )
      .join("")}
  `;

  /* -------------------------------------
     RENDER PROJECTS
  ------------------------------------- */
  projects.forEach(project => {
    const filterSlug = slugify(project.categories[0]);

    const col = document.createElement("div");
    col.className = `col-lg-4 col-md-6 gallery-item ${filterSlug}`;

    col.innerHTML = `
      <div class="project-card">
        <img src="${project.path + project.cover}" alt="${project.title}">
        <div class="project-overlay">
          <div>
            <div class="project-title">${project.title}</div>
            <div class="project-categories">
              ${(project.allCategories || project.categories).join(" / ")}
            </div>
          </div>
        </div>
      </div>
    `;

    /* -------------------------------------
       HIDDEN LIGHTGALLERY LINKS
    ------------------------------------- */
    const hiddenGallery = document.createElement("div");
    hiddenGallery.className = "lg-hidden";

    project.images.forEach(img => {
      hiddenGallery.innerHTML += `
        <a href="${project.path + img}" class="project-link"></a>
      `;
    });

    col.appendChild(hiddenGallery);
    galleryContainer.appendChild(col);

    /* -------------------------------------
       INIT LIGHTGALLERY (SAFE)
    ------------------------------------- */
    if (window.lightGallery) {
      const plugins = [];
      if (window.lgThumbnail) plugins.push(lgThumbnail);
      if (window.lgZoom) plugins.push(lgZoom);

      lightGallery(hiddenGallery, {
        selector: ".project-link",
        plugins,
        thumbnail: true,
        zoom: true,
        counter: true,
        download: false
      });
    }

    /* -------------------------------------
       OPEN GALLERY ON CARD CLICK
    ------------------------------------- */
    col.querySelector(".project-card").addEventListener("click", () => {
      const first = hiddenGallery.querySelector(".project-link");
      if (first) first.click();
    });
  });

  /* -------------------------------------
     INIT ISOTOPE (AFTER IMAGES LOAD)
  ------------------------------------- */
  const iso = new Isotope(galleryContainer, {
    itemSelector: ".gallery-item",
    layoutMode: "fitRows",
    percentPosition: true
  });

  // 🔥 CRITICAL: wait for images before layout
  imagesLoaded(galleryContainer, () => {
    iso.layout();
  });

  /* -------------------------------------
     FILTER HANDLING
  ------------------------------------- */
  filtersContainer.addEventListener("click", e => {
    if (!e.target.classList.contains("filter-btn")) return;

    filtersContainer
      .querySelectorAll(".filter-btn")
      .forEach(btn => btn.classList.remove("active"));

    e.target.classList.add("active");

    iso.arrange({
      filter: e.target.dataset.filter
    });
  });
});
