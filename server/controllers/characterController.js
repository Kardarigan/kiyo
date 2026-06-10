import { join } from "path";
import { readJSON, writeJSON } from "../utils/fileSystem.js";
import { sendJSON, sendError, sendSuccess } from "../utils/responseHelper.js";
import config from "../config.js";

export const characterController = {
  async getCharacter(req, res) {
    const activeCharacter = await readJSON(config.siteConfigPath);
    if (!activeCharacter?.activeCharacter) {
      sendError(res, "No active character configured", 404);
      return;
    }

    const charPath = join(
      config.characterDir,
      `${activeCharacter.activeCharacter}.json`
    );
    const data = await readJSON(charPath);

    if (!data) {
      sendError(res, "Character data not found", 404);
      return;
    }

    sendJSON(res, data);
  },

  async getCharacterById(req, res, id) {
    const charPath = join(config.characterDir, `${id}.json`);
    const data = await readJSON(charPath);

    if (!data) {
      sendError(res, `Character '${id}' not found`, 404);
      return;
    }

    sendJSON(res, data);
  },

  async listCharacters(req, res) {
    const indexData = await readJSON(join(config.characterDir, "index.json"));
    sendJSON(res, indexData || { characters: [] });
  },

  async updateCharacter(req, res) {
    const { characterId, data } = req.body;

    if (!characterId || !data) {
      sendError(res, "characterId and data are required", 400);
      return;
    }

    const charPath = join(config.characterDir, `${characterId}.json`);
    const existing = await readJSON(charPath);

    if (!existing) {
      sendError(res, "Character not found", 404);
      return;
    }

    // Merge data
    const updated = { ...existing, ...data };
    updated.meta = {
      ...existing.meta,
      lastModified: new Date().toISOString().split("T")[0],
    };

    await writeJSON(charPath, updated);
    sendSuccess(res, updated, "Character updated successfully");
  },
};
