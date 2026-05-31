/*
 * Body parser middleware
 * Parses JSON and URL-encoded request bodies
 */

export async function bodyParser(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString();

      // Only parse if there's content
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
