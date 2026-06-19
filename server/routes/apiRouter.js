const { bodyParser } = require("../middleware/bodyParser.js");
const { apiAuth } = require("../middleware/apiAuth.js");
const {
  characterController,
} = require("../controllers/characterController.js");
const { configController } = require("../controllers/configController.js");
const { sendError } = require("../utils/responseHelper.js");

/*
 * API Router
 * handles all /api/v1/* requests
 */
async function apiRouter(req, res, url) {
  const path = url.pathname;
  const method = req.method;

  // Public routes (no auth)
  if (method === "GET") {
    if (path === "/api/v1/character") {
      await characterController.getCharacter(req, res);
      return;
    }

    const charMatch = path.match(/^\/api\/v1\/characters\/([\w-]+)$/);
    if (charMatch) {
      await characterController.getCharacterById(req, res, charMatch[1]);
      return;
    }

    if (path === "/api/v1/characters") {
      await characterController.listCharacters(req, res);
      return;
    }

    if (path === "/api/v1/config") {
      await configController.getConfig(req, res);
      return;
    }
  }

  // Auth verification
  if (path === "/api/v1/auth/verify") {
    if (apiAuth(req, res)) {
      const { sendJSON } = require("../utils/responseHelper.js");
      sendJSON(res, { authenticated: true });
    }
    return;
  }

  // Protected routes (require auth)
  if (!apiAuth(req, res)) return;

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    try {
      await bodyParser(req);
    } catch (error) {
      sendError(res, "Invalid request body", 400);
      return;
    }
  }

  if (path === "/api/v1/character" && method === "PUT") {
    await characterController.updateCharacter(req, res);
    return;
  }

  if (path === "/api/v1/config" && method === "PUT") {
    await configController.updateConfig(req, res);
    return;
  }

  sendError(res, "API endpoint not found", 404);
}

module.exports = { apiRouter };
