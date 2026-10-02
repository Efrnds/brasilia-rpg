import * as THREE from "../../vendor/three.module.js";
export const MATERIAL_LIBRARY = {
  concrete: { roughness: 0.96, metalness: 0, variation: 9 },
  wood: { roughness: 0.82, metalness: 0, variation: 14 },
  metal: { roughness: 0.52, metalness: 0.55, variation: 4 },
  fabric: { roughness: 1, metalness: 0, variation: 8 },
  paper: { roughness: 0.94, metalness: 0, variation: 3 },
  leaf: { roughness: 0.9, metalness: 0, variation: 6 },
  glass: { roughness: 0.12, metalness: 0.05, variation: 0 },
};
const textures = new Map();
export function surfaceTexture(kind) {
  if (textures.has(kind)) return textures.get(kind);
  const spec = MATERIAL_LIBRARY[kind] || MATERIAL_LIBRARY.concrete,
    size = 64,
    data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;
      let grain = (hash % 101) / 100 - 0.5;
      if (kind === "wood")
        grain =
          Math.sin(x * 0.65 + Math.sin(y * 0.12) * 1.6) * 0.7 + grain * 0.3;
      if (kind === "fabric") grain = ((x + y) % 2 ? 0.4 : -0.4) + grain * 0.15;
      const value = Math.round(238 + grain * spec.variation);
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = value;
      data[i + 3] = 255;
    }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.userData.shared = true;
  texture.needsUpdate = true;
  textures.set(kind, texture);
  return texture;
}
export function createSurfaceMaterial(kind, color) {
  const spec = MATERIAL_LIBRARY[kind] || MATERIAL_LIBRARY.concrete;
  return new THREE.MeshStandardMaterial({
    color,
    roughness: spec.roughness,
    metalness: spec.metalness,
    map: kind === "glass" ? null : surfaceTexture(kind),
  });
}
export function disposeSurfaceTextures() {
  for (const texture of textures.values()) texture.dispose();
  textures.clear();
}
