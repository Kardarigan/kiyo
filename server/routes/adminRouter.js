const { join } = require("path");
const { readFile } = require("fs/promises");
const config = require("../config.js");

/*
 * Admin Router
 * serves the admin panel and handles admin API calls
 */

async function adminRouter(req, res, url) {
  const pathname = url.pathname;

  // Serve admin.html
  if (pathname === "/admin" || pathname === "/admin/") {
    try {
      const html = await readFile(join(config.srcDir, "admin.html"), "utf-8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch (error) {
      res.writeHead(404);
      res.end("Admin panel not found");
    }
    return;
  }

  // Admin API callsare handled by apiRouter
  // This is for page serving only
  res.writeHead(404);
  res.end("Admin route not found");
}

module.exports = { adminRouter };
