import config from "../config.js";
import { sendJSON, sendError } from "../utils/responseHelper.js";

export const authController = {
  verify(req, res) {
    sendJSON(res, { authenticated: true, user: config.adminUser });
  },

  logout(req, res) {
    sendJSON(res, { success: true, message: "Logged out successfully" });
  },
};
