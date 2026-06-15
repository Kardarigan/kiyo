const { join, resolve } = require("path");
const { promises: fs } = require("fs");
const config = require("../config.js");

async function staticFiles(req, res, pathname) {
  let filePath;

  if (pathname.startsWith("/css/")) {
    filePath = join(config.srcDir, pathname);
  } else if (pathname.startsWith("/js/")) {
    filePath = join(config.srcDir, pathname);
  } else if (pathname.startsWith("/data/")) {
    filePath = join(config.srcDir, pathname);
  } else if (pathname.startsWith("/fonts/")) {
    filePath = join(config.publicDir, pathname);
  } else if (pathname.startsWith("/images/")) {
    filePath = join(config.publicDir, pathname);
  } else if (pathname.startsWith("/audio/")) {
    filePath = join(config.publicDir, pathname);
  } else {
    // Default to public directory
    filePath = join(config.publicDir, pathname);
  }

  // Security: Prevent directory traversal
  const resolvedPath = resolve(filePath);
  const normalizedRoot = resolve(config.rootDir);

  if (!resolvedPath.startsWith(normalizedRoot)) {
    console.warn(`Security: Attempted to access ${resolvedPath}`);
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    // Check if file exists and is readable
    await fs.access(resolvedPath);

    // Get file stats
    const stats = await fs.stat(resolvedPath);

    // Don't serve directories
    if (stats.isDirectory()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    // Determine MIME type
    const ext = pathname.substring(pathname.lastIndexOf(".")).toLowerCase();
    let contentType = config.mimeTypes[ext] || "application/octet-stream";

    // Special handling for font files
    if (ext === ".ttf") contentType = "font/ttf";
    if (ext === ".otf") contentType = "font/otf";
    if (ext === ".woff") contentType = "font/woff";
    if (ext === ".woff2") contentType = "font/woff2";
    if (ext === ".css") contentType = "text/css; charset=utf-8";
    if (ext === ".js") contentType = "application/javascript; charset=utf-8";

    // Read and serve file
    const fileContent = await fs.readFile(resolvedPath);

    // Set caching headers
    const cacheControl = ext.match(
      /\.(ttf|otf|woff|woff2|jpg|jpeg|png|gif|webp|svg|ico|mp3)$/i
    )
      ? "public, max-age=31536000, immutable"
      : "no-cache, must-revalidate";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
      "Content-Length": stats.size,
      "Access-Control-Allow-Origin": "*",
    });

    res.end(fileContent);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`404: ${pathname} not found at ${resolvedPath}`);
      res.writeHead(404);
      res.end("File not found");
    } else {
      console.error(`Error serving ${pathname}:`, error);
      res.writeHead(500);
      res.end("Internal server error");
    }
  }
}

module.exports = { staticFiles };
