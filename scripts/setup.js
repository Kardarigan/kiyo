import { mkdir, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const dirs = [
  "public/fonts",
  "public/images/korekiyo",
  "public/audio",
  "src/scss/abstracts",
  "src/scss/base",
  "src/scss/layout",
  "src/scss/components",
  "src/scss/pages",
  "src/scss/animations",
  "src/scss/themes",
  "src/js/core",
  "src/js/pages",
  "src/js/components",
  "src/js/features",
  "src/js/three/geometries",
  "src/js/three/materials",
  "src/js/three/effects",
  "src/js/admin",
  "src/js/utils",
  "src/data/characters",
  "server/middleware",
  "server/routes",
  "server/controllers",
  "server/models",
  "server/utils",
  "scripts",
  "tests",
];

const files = {
  ".gitignore": "node_modules/\n.env\n",
  ".env.example": "PORT=3000\nADMIN_USER=kiyo\nADMIN_PASS=anthropology1933\n",
  "src/data/site-config.json": JSON.stringify(
    { activeCharacter: "korekiyo" },
    null,
    2
  ),
  "src/data/characters/index.json": JSON.stringify(
    {
      characters: [
        {
          id: "korekiyo",
          name: "Korekiyo Shinguji",
          file: "korekiyo.json",
          active: true,
        },
      ],
    },
    null,
    2
  ),
};

async function setup() {
  for (const dir of dirs) {
    await mkdir(join(root, dir), { recursive: true });
  }
  for (const [filePath, content] of Object.entries(files)) {
    await writeFile(join(root, filePath), content);
  }
  console.log("Project structure created successfully.");
}

setup().catch(console.error);
