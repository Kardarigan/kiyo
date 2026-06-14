const { readFile } = require("fs/promises");
const { join, dirname } = require("path");
const { fileURLToPath } = require("url");

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataPath = join(root, "src", "data", "characters", "korekiyo.json");

async function validate() {
  console.log("Validating korekiyo.json...");
  const raw = await readFile(dataPath, "utf-8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("Invalid JSON:", e.message);
    process.exit(1);
  }

  const errors = [];
  if (!data.character?.name) errors.push("Missing character.name");
  if (!data.theme?.colors) errors.push("Missing theme.colors");
  if (!data.pages?.home) errors.push("Missing pages.home");

  if (errors.length) {
    console.error("Validation errors:");
    errors.forEach((e) => console.error(" -", e));
    process.exit(1);
  }
  console.log("Data file is valid.");
}

validate();
