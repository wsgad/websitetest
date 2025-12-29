document.addEventListener('DOMContentLoaded', () => {
  // Run ONLY on photography page
  if (!document.body.classList.contains('photography-page')) return;

  /* =========================================================
     SAFETY PATCH
     Prevent main.js crash if .scroll-top doesn't exist
     ========================================================= */
  if (!document.querySelector('.scroll-top')) {
    const dummyScrollTop = document.createElement('a');
    dummyScrollTop.className = 'scroll-top';
    dummyScrollTop.href = '#';
    dummyScrollTop.style.display = 'none';
    document.body.appendChild(dummyScrollTop);
  }

  /* =========================================================
     GALLERY LOGIC
     ========================================================= */

  const filtersContainer = document.querySelector('.gallery-filters');
  const galleryContainer = document.querySelector('.gallery-container');

  if (!filtersContainer || !galleryContainer) return;

  fetch('assets/img/photography/gallery.json')
    .then(response => response.json())
    .then(data => {
      const categoriesSet = new Set();

      data.projects.forEach(project => {
        project.categories.forEach(cat => categoriesSet.add(cat));

        const col = document.createElement('div');
        col.className = `col-lg-4 col-md-6 project-item ${project.categories.join(' ')}`;

        col.innerHTML = `
          <div class="project-card" data-src="${project.path + project.cover}">
            <img src="${project.path + project.cover}" alt="${project.title}">
            <div class="project-overlay">
              <div>
                <div class="project-title">${project.title}</div>
                <div class="project-categories">${project.categories.join(', ')}</div>
              </div>
            </div>
          </div>
        `;

        galleryContainer.appendChild(col);
      });

      /* =========================================================
         BUILD FILTER BUTTONS
         ========================================================= */
      filtersContainer.innerHTML =
        `<button class="filter-btn active" data-filter="*">All</button>` +
        [...categoriesSet].map(cat =>
          `<button class="filter-btn" data-filter=".${cat}">${cat}</button>`
        ).join('');

      /* =========================================================
         INIT ISOTOPE (AFTER IMAGES LOAD)
         ========================================================= */
      imagesLoaded(galleryContainer, () => {
        const iso = new Isotope(galleryContainer, {
          itemSelector: '.project-item',
          layoutMode: 'fitRows'
        });

        filtersContainer.addEventListener('click', e => {
          if (!e.target.classList.contains('filter-btn')) return;

          filtersContainer.querySelectorAll('.filter-btn')
            .forEach(btn => btn.classList.remove('active'));

          e.target.classList.add('active');
          iso.arrange({ filter: e.target.dataset.filter });
        });
      });

      /* =========================================================
         INIT LIGHTGALLERY
         ========================================================= */
      lightGallery(galleryContainer, {
        selector: '.project-card',
        download: false,
        counter: false
      });
    })
    .catch(err => {
      console.error('Gallery JSON load error:', err);
    });
});
