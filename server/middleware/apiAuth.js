import config from "../config.js";

/*
 * Simple API authentication middleware
 * Uses Basic Auth for admin endpoints
 */

export function apiAuth(req, res) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.writeHead(401, {
      "WWW-Authenticate": 'Basic realm="Korekiyo CMS"',
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ error: "Authentication required" }));
    return false;
  }

  const base64 = authHeader.substring(6);
  const decoded = Buffer.from(base64, "base64").toString();
  const [username, password] = decoded.split(":");

  if (username !== config.adminUser || password !== config.adminPass) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid credentials" }));
    return false;
  }

  return true;
}
