/**
 * Stage motely-wasm side-loadable runtime into public/motely-wasm for browser boot.
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "..");
const src = resolve(appRoot, "node_modules", "motely-wasm", "bin");
const dst = resolve(appRoot, "public", "motely-wasm");

if (!existsSync(src)) {
  console.warn(
    "[copy-motely-wasm] Skip: node_modules/motely-wasm/bin not found (run npm install)."
  );
  process.exit(0);
}

mkdirSync(dst, { recursive: true });
cpSync(src, dst, { recursive: true });
console.log("[copy-motely-wasm] Staged", dst);
