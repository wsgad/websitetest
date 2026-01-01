const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");

const ROOT = "assets/img/photography";
const OUTPUT = path.join(ROOT, "gallery.json");
const WATCH = process.argv.includes("--watch");

if (!fs.existsSync(ROOT)) {
  console.error("❌ Photography folder not found:", ROOT);
  process.exit(1);
}

let debounceTimer = null;

function buildGallery() {
  const projects = [];

  const folders = fs
    .readdirSync(ROOT)
    .filter((f) => fs.statSync(path.join(ROOT, f)).isDirectory());

  for (const folder of folders) {
    const folderPath = path.join(ROOT, folder);
    const metaPath = path.join(folderPath, "_meta.json");

    if (!fs.existsSync(metaPath)) continue;

    let meta;
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch {
      console.warn(`⚠️ Invalid _meta.json in ${folder}, skipping`);
      continue;
    }

    if (!Array.isArray(meta.categories) || !meta.categories.length) continue;

    /* =====================================================
       🔑 READ IMAGES FROM _meta.json (WITH AI FLAGS)
    ===================================================== */

    const metaImages = Array.isArray(meta.images) ? meta.images : [];

    // Only keep images that actually exist
    const validImages = metaImages.filter(img =>
      img.file && fs.existsSync(path.join(folderPath, img.file))
    );

    if (!validImages.length) continue;

    /* =====================================================
       🔑 COVER FIRST
    ===================================================== */

    const orderedImages = meta.cover
      ? [
          validImages.find(img => img.file === meta.cover),
          ...validImages.filter(img => img.file !== meta.cover)
        ].filter(Boolean)
      : validImages;

    projects.push({
      id: folder.toLowerCase().replace(/\s+/g, "-"),
      title: meta.title,
      categories: [meta.categories[0]],
      allCategories: meta.categories,
      path: `${ROOT}/${folder}/`,
      cover: meta.cover,
      images: orderedImages.map(img => ({
        file: img.file,
        ai: img.ai === true
      })),
      location: meta.location || "",
      date: meta.date || "",
      description: meta.description || "",
      order: meta.order
    });
  }

  projects.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  fs.writeFileSync(OUTPUT, JSON.stringify({ projects }, null, 2));
  console.log(`✅ gallery.json generated (${projects.length} projects)`);
}

function debounceBuild() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(buildGallery, 300);
}

// Initial build
buildGallery();

// WATCH MODE
if (WATCH) {
  console.log("👀 Watch mode enabled…");

  fs.watch(ROOT, { recursive: true }, (event, filename) => {
    if (!filename) return;

    if (
      filename.endsWith(".jpg") ||
      filename.endsWith(".jpeg") ||
      filename.endsWith(".png") ||
      filename.endsWith(".webp") ||
      filename.endsWith("_meta.json")
    ) {
      debounceBuild();
    }
  });
}