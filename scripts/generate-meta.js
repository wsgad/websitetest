/**
 * generate-meta.js
 * -----------------
 * Creates a default _meta.json file inside each project folder
 * if it does not already exist.
 *
 * Usage:
 * 1. Place this file in /scripts/generate-meta.js
 * 2. Run: node scripts/generate-meta.js
 *
 * Folder structure expected:
 * assets/img/photography/<project-folder>/
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../assets/img/photography");

if (!fs.existsSync(ROOT)) {
  console.error("❌ Photography folder not found:", ROOT);
  process.exit(1);
}

fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .forEach(dir => {
    const projectPath = path.join(ROOT, dir.name);
    const metaPath = path.join(projectPath, "_meta.json");

    if (fs.existsSync(metaPath)) {
      console.log(`✔ _meta.json already exists → ${dir.name}`);
      return;
    }

    const title = dir.name
      .replace(/-/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase());

    const meta = {
      title: title,
      categories: []
    };

    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    console.log(`➕ Created _meta.json → ${dir.name}`);
  });

console.log("✅ Meta generation complete");
