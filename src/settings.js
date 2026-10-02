import { clamp } from "./domain.js";
export const EXTRA_SETTINGS = {
  effectsVolume: 100,
  musicVolume: 30,
  ambienceVolume: 25,
  sensitivityY: 50,
  invertX: false,
  invertY: false,
  captureMouse: true,
  showMinimap: true,
  fov: 58,
  textScale: 100,
  hudScale: 100,
  shake: true,
  flashes: true,
  hitStop: true,
  blood: true,
  assistTiming: false,
};
export function sanitizeSettings(source = {}) {
  const result = { ...EXTRA_SETTINGS };
  for (const key of ["effectsVolume", "musicVolume", "ambienceVolume"])
    result[key] = clamp(
      Number.isFinite(Number(source[key])) ? Number(source[key]) : result[key],
      0,
      100,
    );
  for (const key of ["sensitivityY"])
    result[key] = clamp(
      Number.isFinite(Number(source[key])) ? Number(source[key]) : result[key],
      10,
      100,
    );
  for (const key of ["fov"])
    result[key] = clamp(
      Number.isFinite(Number(source[key])) ? Number(source[key]) : result[key],
      45,
      80,
    );
  for (const key of ["textScale", "hudScale"])
    result[key] = clamp(
      Number.isFinite(Number(source[key])) ? Number(source[key]) : result[key],
      85,
      140,
    );
  for (const key of [
    "invertX",
    "invertY",
    "captureMouse",
    "showMinimap",
    "shake",
    "flashes",
    "hitStop",
    "blood",
    "assistTiming",
  ])
    if (typeof source[key] === "boolean") result[key] = source[key];
  return result;
}
export function applyAccessibility(settings) {
  document.documentElement.style.setProperty(
    "--text-scale",
    String(settings.textScale / 100),
  );
  document.documentElement.style.setProperty(
    "--hud-scale",
    String(settings.hudScale / 100),
  );
  document
    .querySelector(".minimap-wrap")
    ?.classList.toggle("hidden", !settings.showMinimap);
  document.body.classList.toggle("reduce-flashes", !settings.flashes);
}
