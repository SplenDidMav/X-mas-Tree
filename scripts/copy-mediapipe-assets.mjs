import { cp, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();

const SRC_DIR = path.join(repoRoot, "node_modules", "@mediapipe", "hands");
const DEST_DIR = path.join(repoRoot, "public", "mediapipe", "hands");

const ALLOW_EXT = new Set([
  ".js",
  ".wasm",
  ".data",
  ".tflite",
  ".binarypb",
  ".json",
  ".txt"
]);

async function fileExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await fileExists(SRC_DIR))) {
    console.warn(`[mediapipe] Source dir not found: ${SRC_DIR}`);
    console.warn("[mediapipe] Did you run `npm install`?");
    process.exit(0);
  }

  await mkdir(DEST_DIR, { recursive: true });
  const entries = await readdir(SRC_DIR);

  let copied = 0;
  for (const name of entries) {
    const src = path.join(SRC_DIR, name);
    const s = await stat(src);
    if (!s.isFile()) continue;

    const ext = path.extname(name);
    if (!ALLOW_EXT.has(ext)) continue;
    if (name === "README.md" || name === "package.json" || name === "index.d.ts") continue;

    const dest = path.join(DEST_DIR, name);
    await cp(src, dest);
    copied += 1;
  }

  console.log(`[mediapipe] Copied ${copied} file(s) to ${path.relative(repoRoot, DEST_DIR)}`);
}

await main();

