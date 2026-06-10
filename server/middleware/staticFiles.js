const { join } = require("path");
const { readFile, access } = require("fs/promises");
const { createReadStream } = require("fs");
const config = require("../config.js");

/*
 * Static file serving middleware
 * Serves files from both /public/ and /src/ directories
 */

async function staticFiles(req, res, pathname) {
  // Determine which directory the file lives in
  let filePath;

  if (
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/audio/")
  ) {
    filePath = join(config.publicDir, pathname);
  } else if (pathname.startsWith("/css/")) {
    // Compiled CSS lives in src/css
    filePath = join(config.srcDir, pathname);
  } else if (pathname.startsWith("/js/")) {
    filePath = join(config.srcDir, pathname);
  } else if (pathname.startsWith("/data/")) {
    filePath = join(config.srcDir, pathname);
  } else {
    filePath = join(config.publicDir, pathname);
  }

  // Security: prevent directory traversal
  const normalizedPath = filePath.replace(/\\/g, "/");
  const normalizedRoot = config.rootDir.replace(/\\/g, "/");
  if (!normalizedPath.startsWith(normalizedRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    // Check if file exists
    await access(filePath);

    // Get MIME type
    const ext = pathname.substring(pathname.lastIndexOf(".")).toLowerCase();
    const contentType = config.mimeTypes[ext] || "application/octet-stream";

    // Cache control for static assets
    const cacheControl = ext.match(/\.(ttf|otf|jpg|jpeg|png|mp3|ico)$/)
      ? "public, max-age=31536000, immutable"
      : "no-cache";

    // Read and server file
    const fileContent = await readFile(filePath);

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
      "Content-Length": fileContent.length,
    });

    res.end(fileContent);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404);
      res.end("File not found");
    } else {
      throw error;
    }
  }
}

module.exports = { staticFiles };
