/*
 * Body parser middleware
 * parses JSON and URL-encoded request bodies
 */

async function bodyParser(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString();

      if (!raw) {
        req.body = {};
        resolve();
        return;
      }

      const contentType = req.headers["content-type"] || "";

      try {
        if (contentType.includes("application/json")) {
          req.body = JSON.parse(raw);
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
          req.body = Object.fromEntries(new URLSearchParams(raw));
        } else {
          req.body = { raw };
        }
        resolve();
      } catch (error) {
        reject(new Error("Invalid request body"));
      }
    });

    req.on("error", reject);
  });
}

module.exports = { bodyParser };
