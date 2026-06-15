const http = require("http");
const url = require("url");
const config = require("./config.js");
const { pageRouter } = require("./routes/pageRouter.js");
const { apiRouter } = require("./routes/apiRouter.js");
const { adminRouter } = require("./routes/adminRouter.js");
const { logger } = require("./middleware/logger.js");
const { staticFiles } = require("./middleware/staticFiles.js");
const { errorHandler } = require("./utils/errorHandler.js");

const server = http.createServer(async (req, res) => {
  try {
    // Log request
    logger(req, res);

    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`[DEBUG] Request: ${req.method} ${pathname}`);

    // API routes
    if (pathname.startsWith(config.apiBase)) {
      await apiRouter(req, res, parsedUrl);
      return;
    }

    // Admin routes
    if (pathname === "/admin" || pathname === "/admin/") {
      await adminRouter(req, res, parsedUrl);
      return;
    }

    // Static files - check extensions
    const staticExtensions = [
      ".css",
      ".js",
      ".json",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".svg",
      ".ico",
      ".ttf",
      ".otf",
      ".woff",
      ".woff2",
      ".mp3",
      ".webp",
      ".txt",
    ];
    const hasExtension = staticExtensions.some((ext) =>
      pathname.toLowerCase().endsWith(ext)
    );

    if (hasExtension) {
      await staticFiles(req, res, pathname);
      return;
    }

    // Page routes (HTML)
    await pageRouter(req, res, pathname);
  } catch (error) {
    console.error("[ERROR]", error);
    errorHandler(res, error);
  }
});

server.listen(config.port, config.host, () => {
  console.log(`
  ╔═════════════════════════════════════════╗
  ║   Korekiyo Shinguji — Dark Shrine       ║
  ║   Server running at:                    ║
  ║   http://${config.host}:${config.port}  ║
  ║   CMS: /admin                           ║
  ╚═════════════════════════════════════════╝    
  `);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
