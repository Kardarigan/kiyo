const { readJSON, writeJSON } = require("../utils/fileSystem.js");
const {
  sendJSON,
  sendError,
  sendSuccess,
} = require("../utils/responseHelper.js");
const config = require("../config.js");

const configController = {
  async getConfig(req, res) {
    const siteConfig = await readJSON(config.siteConfigPath);
    sendJSON(res, siteConfig || { activeCharacter: "korekiyo" });
  },

  async updateConfig(req, res) {
    const { data } = req.body;

    if (!data) {
      sendError(res, "Config data is required", 400);
      return;
    }

    const existing = (await readJSON(config.siteConfigPath)) || {};
    const updated = { ...existing, ...data };

    await writeJSON(config.siteConfigPath, updated);
    sendSuccess(res, updated, "Config updated successfully");
  },
};

module.exports = { configController };
