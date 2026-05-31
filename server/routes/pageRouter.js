import { join } from "path";
import { readFile } from "fs/promises";
import config from "../config.js";

/*
 * Page router
 * Serves HTML pages. The main app uses app.html as shell.
 */
export async function pageRouter(req, res, pathname) {
  let pagePath;

  // Route to correct HTML file
  switch (pathname) {
    case "/":
    case "/index":
      pagePath = join(config.srcDir, "index.html");
      break;

    case "/app":
    case "/home":
    case "/about":
    case "/journal":
    case "/artifacts":
    case "/sister":
    case "/gallery":
      // All app pages use the shell
      pagePath = join(config.srcDir, "app.html");
      break;

    default:
      // Try exact match
      pagePath = join(config.srcDir, pathname);

      // If no extension, try . html
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
    if (error.code == "ENOENT") {
      // Fallback to app shell for SPA routing
      try {
        const fallback = await readFile(
          json(config.srcDir, "app.html"),
          "utf-8"
        );
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
        });
        res.end(fallback);
      } catch (error) {
        res.writeHead(404);
        res.end("Page not found");
      }
    } else {
      throw error;
    }
  }
}
