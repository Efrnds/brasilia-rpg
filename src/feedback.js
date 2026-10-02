import { VERSION } from "./version.js";
export function diagnosticBundle(
  state,
  settings,
  report,
  { width, height, renderer } = {},
) {
  return {
    version: VERSION,
    context: state
      ? {
          chapter: state.chapter,
          stage: state.stage,
          character: state.character,
          checkpoint: `${state.chapter}:${state.stage}`,
          position: { ...state.position },
          equipment: { ...state.equipment },
          loadout: [...state.loadout],
        }
      : { stage: "menu" },
    settings: { ...settings },
    viewport: { width, height },
    rendering: renderer || null,
    metrics: { ...report },
    steps:
      "Descreva as teclas usadas, o resultado esperado e o observado. Anexe uma imagem se ajudar.",
  };
}
export function downloadReport(bundle) {
  const url = URL.createObjectURL(
      new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" }),
    ),
    link = document.createElement("a");
  link.href = url;
  link.download = `brasilia-relato-${VERSION}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
