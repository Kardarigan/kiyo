const config = require("../config.js");
const { sendJSON } = require("../utils/responseHelper.js");

const authController = {
  verify(req, res) {
    sendJSON(res, { authenticated: true, user: config.adminUser });
  },

  logout(req, res) {
    sendJSON(res, { success: true, message: "Logged out successfully" });
  },
};

module.exports = { authController };
