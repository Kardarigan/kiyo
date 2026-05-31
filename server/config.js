import { fileURLTopath } from "url";
import { dirname, join } from "path";

const __filename = fileURLTopath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, "..");

export default {
  port: process.env.PORT || 3000,
  host: process.env.HOST || "localhost",
  rootDir,
  publicDir: join(rootDir, "public"),
  srcDir: join(rootDir, "src"),
  dataDir: join(rootDir, "src", "data"),
  characterDir: join(rootDir, "src", "data", "characters"),
  siteConfigPath: join(rootDir, "src", "data", "site-config.json"),

  // CMS credentials (change in production)
  adminUser: process.env.ADMIN_USER || "kiyo",
  adminPass: process.env.ADMIN_PASS || "anthropology1933",

  // API settings
  apiBase: "/api/v1",

  // Content types
  mimeTypes: {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".mp3": "audio/mp3",
    ".ico": "image/x-icon",
    ".txt": "text/plain; charset=utf-8",
  },
};
