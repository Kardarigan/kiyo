import { readFile, writeFile, copyFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const templatePath = join(root, "src", "data", "characters", "template.json");

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function main() {
  console.log("Create a new character from template.");
  const id = await ask("Character ID (slug): ");
  const name = await ask("Display Name: ");
  const title = await ask("Title: ");

  const template = JSON.parse(await readFile(templatePath, "utf-8"));
  template.character.id = id;
  template.character.name = name;
  template.character.title = title;

  const targetPath = join(root, "src", "data", "characters", `${id}.json`);
  await writeFile(targetPath, JSON.stringify(template, null, 2));

  // update index
  const indexPath = join(root, "src", "data", "characters", "index.json");
  const index = JSON.parse(await readFile(indexPath, "utf-8"));
  index.characters.push({ id, name, title, file: `${id}.json`, active: false });
  await writeFile(indexPath, JSON.stringify(index, null, 2));

  console.log(`Character "${name}" created at ${targetPath}`);
}

main().catch(console.error);
