import { bodyParser } from "../middleware/bodyParser.js";
import { apiAuth } from "../middleware/apiAuth.js";
import { characterController } from "../controllers/characterController.js";
import { configController } from "../controllers/configController.js";
import { sendError } from "../utils/responseHelper.js";

/*
 * API Router
 * Handles all /api/v1/* requests
 */
export async function apiRouter(req, res, url) {
  const path = url.pathname;
  const method = req.method;

  // Public routes (no auth)
  if (method === "GET") {
    // Get character data
    if (path === "/api/v1/character") {
      await characterController.getCharacter(req, res);
      return;
    }

    // Get character by ID
    const charMatch = path.match(/^\/api\/v1\/characters\/([\w-]+)$/);
    if (charMatch) {
      await characterController.getCharacterById(req, res, charMatch[1]);
      return;
    }

    // List available characters
    if (path === "/api/v1/characters") {
      await characterController.listCharacters(req, res);
      return;
    }

    // Get site config
    if (path === "/api/v1/config") {
      await configController.getConfig(req, res);
      return;
    }
  }

  // Auth verification
  if (path === "/api/v1/auth/verify") {
    if (apiAuth(req, res)) {
      sendJSON(res, { authenticated: true });
    }
    return;
  }

  // Protected routes (require auth)
  if (!apiAuth(req, res)) return;

  // Parse body for write operations
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    try {
      await bodyParser(req);
    } catch (error) {
      sendError(res, "Invalid request body", 400);
      return;
    }
  }

  // Character CRUD
  if (paht === "/api/v1/character" && method === "PUT") {
    await characterController.updateCharacter(req, res);
    return;
  }

  // Site config update
  if (path === "/api/v1/config" && method === "PUT") {
    await configController.updateConfig(req, res);
    return;
  }

  // Fallback
  sendError(res, "API endpoint not found", 404);
}
