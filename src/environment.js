export const ENVIRONMENT_OBJECTS = {
  1: [
    {
      id: "commission",
      name: "Quadro de comissões",
      point: { x: 15, z: -38 },
      kind: "console",
      hint: "Documentação interrompe um braço do Centrão.",
    },
    {
      id: "secret",
      name: "Armário da copa",
      point: { x: -29, z: 12.5 },
      kind: "cabinet",
      hint: "Um crachá antigo permite defender com menos esforço.",
    },
  ],
  2: [
    {
      id: "broadcast",
      name: "Mesa de transmissão",
      point: { x: -6, z: 17 },
      kind: "console",
      hint: "Desliga as câmeras auxiliares.",
    },
    {
      id: "cameraA",
      name: "Câmera esquerda",
      point: { x: 0, z: -25 },
      kind: "camera",
      hint: "Cada câmera desligada reduz a audiência do chefe.",
    },
    {
      id: "cameraB",
      name: "Câmera direita",
      point: { x: 20, z: -36 },
      kind: "camera",
      hint: "Remova a amplificação antes do clímax.",
    },
    {
      id: "secret",
      name: "Estojo do técnico",
      point: { x: -30, z: -8 },
      kind: "cabinet",
      hint: "Fone reserva: interrupções recuperam fôlego.",
    },
  ],
  3: [
    {
      id: "relay",
      name: "Relé de encaminhamento",
      point: { x: 17, z: 10 },
      kind: "console",
      hint: "Interrompe reforços automáticos.",
    },
    {
      id: "bridge",
      name: "Trava da ponte original",
      point: { x: -14, z: -15 },
      kind: "console",
      hint: "Com a prova, abre o atalho para o depósito.",
    },
    {
      id: "secret",
      name: "Caixa da informática",
      point: { x: -22, z: -18 },
      kind: "cabinet",
      hint: "Roteador reserva com recarga de apoio menor.",
    },
  ],
};
export function environmentTargets(state) {
  return (ENVIRONMENT_OBJECTS[state.chapter] || [])
    .filter((o) => !state.environment[`${state.chapter}:${o.id}`])
    .map((o) => ({
      ...o,
      id: `env:${o.id}`,
      x: o.point.x,
      z: o.point.z,
      reach: 2.6,
      label: o.name,
    }));
}
