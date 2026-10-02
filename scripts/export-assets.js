import { createCharacterRig, RIG_CLIPS } from "../assets/pack/characters.js";
import { exportGLB } from "../assets/pack/glb.js";
import {
  ARCHITECTURE,
  createArchitecture,
} from "../assets/pack/architecture.js";
import { writeFile, mkdir } from "node:fs/promises";
import { createProp, CATALOG } from "../assets/pack/props.js";
await mkdir("assets/pack/models", { recursive: true });
for (const kind of Object.keys(CATALOG)) {
  await writeFile(
    `assets/pack/models/${kind}.json`,
    JSON.stringify(createProp(kind).toJSON()),
  );
  await writeFile(
    `assets/pack/models/${kind}.glb`,
    new Uint8Array(exportGLB(createProp(kind))),
  );
}
for (const kind of Object.keys(ARCHITECTURE)) {
  const model = createArchitecture(kind);
  await writeFile(
    `assets/pack/models/${kind}.json`,
    JSON.stringify(model.toJSON()),
  );
  await writeFile(
    `assets/pack/models/${kind}.glb`,
    new Uint8Array(exportGLB(model)),
  );
}
await writeFile(
  "assets/pack/manifest.json",
  JSON.stringify(
    {
      version: 3,
      origin: "Modelagem local por código, sem modelos externos",
      characters: [
        "luli",
        "folfonaro",
        "nair",
        "assessor",
        "estagiario",
        "tio",
      ],
      clips: RIG_CLIPS,
      collision:
        "footprint dos props em X/Z; tamanho da arquitetura em X/Y/Z; posicionamento deve registrar obstáculo no jogo",
      variants: "variant inteiro estável muda distribuição da vegetação",
      license: "CC0-1.0",
      units: "meters",
      pivot: "ground-center",
      assets: CATALOG,
      architecture: ARCHITECTURE,
      exports: ["Three JSON", "GLB 2.0"],
      glbNote:
        "Materiais PBR de cor sólida; texturas procedurais disponíveis no runtime local.",
    },
    null,
    2,
  ),
);
console.log(
  `Exportados ${Object.keys(CATALOG).length} modelos Three.js ObjectLoader.`,
);

for (const kind of [
  "luli",
  "folfonaro",
  "nair",
  "assessor",
  "estagiario",
  "tio",
]) {
  const model = createCharacterRig(kind);
  await writeFile(
    `assets/pack/models/character-${kind}.json`,
    JSON.stringify(model.root.toJSON()),
  );
  await writeFile(
    `assets/pack/models/character-${kind}.glb`,
    new Uint8Array(exportGLB(model.root)),
  );
}
await writeFile(
  "assets/pack/animation-clips.json",
  JSON.stringify(RIG_CLIPS, null, 2),
);
