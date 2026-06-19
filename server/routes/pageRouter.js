const { join } = require("path");
const { promisify } = require("util");
const fs = require("fs");
const readFile = promisify(fs.readFile);
const config = require("../config.js");

async function pageRouter(req, res, pathname) {
  let pagePath;

  if (pathname === "/" || pathname === "/index") {
    pagePath = join(config.srcDir, "index.html");
  } else if (
    pathname === "/app" ||
    pathname === "/app/" ||
    pathname.startsWith("/app/")
  ) {
    pagePath = join(config.srcDir, "app.html");
  } else {
    pagePath = join(config.srcDir, pathname);
    if (!pathname.includes(".")) {
      pagePath = join(config.srcDir, `${pathname}.html`);
    }
  }

  try {
    const html = await readFile(pagePath, "utf-8");
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    });
    res.end(html);
  } catch (error) {
    if (error.code === "ENOENT") {
      try {
        const fallback = await readFile(
          join(config.srcDir, "app.html"),
          "utf-8"
        );
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
        });
        res.end(fallback);
      } catch {
        res.writeHead(404);
        res.end("Page not found");
      }
    } else {
      console.error("Page router error:", error);
      res.writeHead(500);
      res.end("Internal server error");
    }
  }
}

module.exports = { pageRouter };
