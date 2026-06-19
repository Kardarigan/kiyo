const { join } = require("path");
const { promisify } = require("util");
const fs = require("fs");
const readFile = promisify(fs.readFile);
const config = require("../config.js");

/*
 * Admin Router
 * serves the admin panel and handles admin API calls
 */

async function adminRouter(req, res, url) {
  const pathname = url.pathname;

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

  res.writeHead(404);
  res.end("Admin route not found");
}

module.exports = { adminRouter };
