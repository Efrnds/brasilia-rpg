export const TUTORIAL_STEPS = [
  { id: "move", text: "Ande pela praça usando as teclas de movimento." },
  { id: "camera", text: "Olhe em volta com o mouse ou as setas. Esc pausa." },
  {
    id: "attack",
    text: "Teste um ataque com clique esquerdo ou a tecla de ataque.",
  },
  {
    id: "dodge",
    text: "Esquive para sair de um aviso de ataque. Observe o custo de fôlego.",
  },
  {
    id: "guard",
    text: "Defenda de frente para reduzir dano e preparar uma resposta.",
  },
  {
    id: "evidence",
    text: "Reúna uma prova e consulte o diário. Contexto abre negociação.",
  },
  {
    id: "negotiation",
    text: "No acesso, apresente a prova e responda à dedução ou escolha o confronto. As duas rotas continuam a história.",
  },
];
export function completeTutorial(state, id) {
  if (
    !TUTORIAL_STEPS.some((s) => s.id === id) ||
    state.tutorial.done.includes(id)
  )
    return false;
  state.tutorial.done.push(id);
  return true;
}
export function nextTutorial(state) {
  return state.tutorial.skipped
    ? null
    : TUTORIAL_STEPS.find((step) => !state.tutorial.done.includes(step.id));
}
