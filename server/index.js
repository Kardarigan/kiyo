const http = require("http");
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
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // API routes
    if (pathname.startsWith(config.apiBase)) {
      await apiRouter(req, res, url);
      return;
    }

    // Admin routes
    if (pathname.startsWith("/admin")) {
      await adminRouter(req, res, url);
      return;
    }

    // Static files from public directory
    if (
      pathname.startsWith("/public/") ||
      pathname.startsWith("/fonts/") ||
      pathname.startsWith("/images/") ||
      pathname.startsWith("/audio/")
    ) {
      await staticFiles(req, res, pathname);
      return;
    }

    // Page routes (SPA shell or direct HTML)
    await pageRouter(req, res, pathname);
  } catch (error) {
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

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
