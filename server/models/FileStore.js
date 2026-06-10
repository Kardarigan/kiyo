const { readJSON, writeJSON, fileExists } = require("../utils/fileSystem.js");
const { join } = require("path");
const config = require("../config.js");

/*
 * File based JSON store with validation
 */

class FileStore {
  constructor(collection) {
    this.collection = collection;
    this.basePath = config.dataDir;
  }

  _getFilePath(id) {
    return join(this.basePath, this.collection, `${id}.json`);
  }

  async findById(id) {
    const path = this._getFilePath(id);
    return await readJSON(path);
  }

  async findAll() {
    const indexPath = join(this.basePath, this.collection, "index.json");
    const index = await readJSON(indexPath);
    return index || [];
  }

  async update(id, data) {
    const path = this._getFilePath(id);
    await writeJSON(path, data);
    return data;
  }

  async exists(id) {
    const path = this._getFilePath(id);
    return await fileExists(path);
  }
}

module.exports = { FileStore };
