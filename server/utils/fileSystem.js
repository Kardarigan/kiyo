const { readFile, writeFile, access, mkdir } = require("fs/promises");
const { dirname } = require("path");
/*
 * Safe file read with JSON parsing
 */

async function readJSON(filePath) {
  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

/*
 * Safe file write with directory creation and formatting
 */
async function writeJSON(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  return true;
}

/*
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

module.exports = { readJSON, writeJSON, fileExists };
