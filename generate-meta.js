const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = "assets/img/photography";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) =>
  new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));

const loadMeta = (metaPath) => {
  if (!fs.existsSync(metaPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(metaPath, "utf8"));
  } catch {
    return {};
  }
};

(async () => {
  if (!fs.existsSync(ROOT)) {
    console.error("❌ Photography folder not found:", ROOT);
    process.exit(1);
  }

  const folders = fs
    .readdirSync(ROOT)
    .filter((f) => fs.statSync(path.join(ROOT, f)).isDirectory());

  console.log("\n📁 Project folders:\n");
  folders.forEach((f, i) => console.log(`${i + 1}) ${f}`));

  const input = await ask("\nWhich folders? (all / 1,3 / enter=cancel): ");
  if (!input) return rl.close();

  const selected =
    input.toLowerCase() === "all"
      ? folders
      : input
          .split(",")
          .map((n) => folders[parseInt(n.trim(), 10) - 1])
          .filter(Boolean);

  for (const folder of selected) {
    const folderPath = path.join(ROOT, folder);
    const metaPath = path.join(folderPath, "_meta.json");
    let meta = loadMeta(metaPath);

    console.log(`\n📁 ${folder}`);

    const mode = (await ask(`
Update mode:
• meta
• ai
• both
• skip
> `)).toLowerCase();

    if (mode === "skip") continue;

    /* =====================
       META FIELD SELECTION
    ===================== */
    if (mode === "meta" || mode === "both") {
      console.log(`
Which meta fields do you want to update?
• title
• categories
• location
• date
• description
• order
• cover
• all
• (enter = none)
`);

      const fieldsInput = await ask("> ");
      const fields =
        fieldsInput === "all"
          ? ["title","categories","location","date","description","order","cover"]
          : fieldsInput
              .split(",")
              .map((f) => f.trim())
              .filter(Boolean);

      if (fields.includes("title")) {
        meta.title =
          (await ask(`Title (${meta.title || folder}): `)) ||
          meta.title ||
          folder;
      }

      if (fields.includes("categories")) {
        const c = await ask(
          `Categories (${(meta.categories || []).join(", ")}): `
        );
        if (c) meta.categories = c.split(",").map((x) => x.trim());
      }

      if (fields.includes("location")) {
        meta.location =
          (await ask(`Location (${meta.location || ""}): `)) ||
          meta.location ||
          "";
      }

      if (fields.includes("date")) {
        meta.date =
          (await ask(`Date (${meta.date || ""}): `)) ||
          meta.date ||
          "";
      }

      if (fields.includes("description")) {
        meta.description =
          (await ask(`Description (${meta.description || ""}): `)) ||
          meta.description ||
          "";
      }

      if (fields.includes("order")) {
        const o = await ask(`Order (${meta.order ?? ""}): `);
        if (o) meta.order = Number(o);
      }

      if (fields.includes("cover")) {
        const imgs = fs
          .readdirSync(folderPath)
          .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
        console.log("\nAvailable images:\n");
        imgs.forEach((f, i) => console.log(`${i + 1}) ${f}`));
        const c = await ask("Cover image number: ");
        const idx = parseInt(c, 10) - 1;
        if (imgs[idx]) meta.cover = imgs[idx];
      }
    }

    /* =====================
       AI IMAGE LABELING
    ===================== */
    if (mode === "ai" || mode === "both") {
      const imgs = fs
        .readdirSync(folderPath)
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

      console.log("\n🖼 Images:\n");
      imgs.forEach((f, i) => console.log(`${i + 1}) ${f}`));

      const aiInput = await ask(`
Which images are AI generated?
• all
• none
• 1,3,5
• (enter = none)
> `);

      let aiIdx = [];

      if (aiInput === "all") aiIdx = imgs.map((_, i) => i);
      else if (aiInput && aiInput !== "none")
        aiIdx = aiInput
          .split(",")
          .map((n) => parseInt(n.trim(), 10) - 1)
          .filter((i) => i >= 0 && i < imgs.length);

      meta.images = imgs.map((file, i) => ({
        file,
        ai: aiIdx.includes(i)
      }));
    }

    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    console.log("✅ _meta.json updated");
  }

  rl.close();
  console.log("\n🎉 Done.\n");
})();