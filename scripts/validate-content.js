import { validateContent } from "../src/content-validation.js";
const errors = validateContent();
if (errors.length) {
  for (const message of errors) console.error(message);
  process.exitCode = 1;
} else
  console.log(
    "Conteúdo válido: mapas, checkpoints, interações, módulos, IDs e ataques.",
  );
