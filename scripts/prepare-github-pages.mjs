import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const source = path.resolve("dist");
const destination = path.resolve("_site");
const projectPath = "/holus-website";
const textExtensions = new Set([".css", ".html", ".js", ".json", ".webmanifest", ".xml"]);

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });

async function rewriteTree(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteTree(filePath);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name))) continue;

    const original = await readFile(filePath, "utf8");
    const rewritten = original
      .replaceAll("/holus-nutrition", projectPath)
      .replace(/\b(href|src|action)=(['"])\/(?!\/)/g, `$1=$2${projectPath}/`)
      .replace(/url\((['"]?)\/(?!\/)/g, `url($1${projectPath}/`);

    if (rewritten !== original) await writeFile(filePath, rewritten);
  }
}

await rewriteTree(destination);
await writeFile(path.join(destination, ".nojekyll"), "");
