import { validateContent } from "../src/content-validation.js";
const errors = validateContent();
if (errors.length) throw new Error(errors.join("\n"));
import { mkdir, cp, rm } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const path of ["index.html", "src", "vendor", "assets", "CREDITOS.md"])
  await cp(path, `dist/${path}`, { recursive: true });
console.log("Build estático criado em dist/; todos os assets são locais.");
