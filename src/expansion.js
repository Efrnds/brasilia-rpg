import { createCharacterRig } from "../assets/pack/characters.js";
export const EXTRA_CASES = {
  prologue: {
    title: "Antes da primeira xícara",
    subtitle: "Copa / origem da investigação",
    goal: "Confira a lista, a doca e o relato da Nair.",
    spawn: { x: 0, z: 9 },
    bounds: { minX: -13, maxX: 13, minZ: -14, maxZ: 14 },
    surfaces: [
      { id: "copa", type: "rect", x: 0, z: 6, w: 20, d: 14, y: 0 },
      { id: "doca", type: "rect", x: 5, z: -7, w: 10, d: 12, y: 0 },
      { id: "ligacao", type: "rect", x: 5, z: 0, w: 5, d: 4, y: 0 },
    ],
    points: [
      {
        id: "list",
        x: -6,
        z: 8,
        title: "Lista da copa",
        text: "37 pacotes separados às 06:25. Assinatura de Dona Nair. Nenhum pacote foi servido.",
        requires: [],
      },
      {
        id: "dock",
        x: 7,
        z: -10,
        title: "Registro da doca",
        text: "06:31: carga transferida sob código 37-B. Destino descrito como material de comunicação.",
        requires: ["list"],
      },
      {
        id: "nair",
        x: 2,
        z: 4,
        title: "Dona Nair",
        text: "Agora temos horário e documento. Vá ao palácio e descubra quem autorizou essa transferência.",
        requires: ["dock"],
      },
    ],
  },
  interlude: {
    title: "A pasta entre os capítulos",
    subtitle: "Gabinete / cruzamento de provas",
    goal: "Cruze os registros sem confundir acesso, destino e autoria.",
    spawn: { x: 0, z: 7 },
    bounds: { minX: -13, maxX: 13, minZ: -12, maxZ: 12 },
    surfaces: [
      { id: "gabinete", type: "rect", x: 0, z: 0, w: 22, d: 20, y: 0 },
    ],
    points: [
      {
        id: "manifest",
        x: -7,
        z: 4,
        title: "Manifesto 37-B",
        text: "A assinatura administrativa autorizou a carga. O documento aponta a Sala de Mídia, mas não identifica quem inventou a crise.",
        requires: [],
      },
      {
        id: "script",
        x: 6,
        z: 1,
        title: "Roteiro da transmissão",
        text: "O contrato de BomDia37 pede usar a falta de café como gancho. A entrega vai ao Centro da Família.",
        requires: ["manifest"],
      },
      {
        id: "board",
        x: 0,
        z: -7,
        title: "Mural de investigação",
        text: "Autorização → entrega → campanha de compartilhamento. O responsável é identificado pela mensagem original, não pelo número de cópias.",
        requires: ["script"],
      },
    ],
  },
  aftermath: {
    title: "O caso da água que sumiu",
    subtitle: "Anexo / investigação posterior",
    goal: "Restabeleça a copa sem fabricar uma nova crise.",
    spawn: { x: -10, z: 10 },
    bounds: { minX: -16, maxX: 17, minZ: -20, maxZ: 17 },
    surfaces: [
      { id: "pátio", type: "rect", x: -6, z: 8, w: 18, d: 16, y: 0 },
      { id: "servico", type: "rect", x: 7, z: 6, w: 10, d: 7, y: 0 },
      {
        id: "rampa",
        type: "rect",
        x: 10,
        z: -3,
        w: 4,
        d: 12,
        y: 0,
        ramp: { axis: "z", from: 3, to: -9, fromY: 0, toY: 1.5 },
      },
      { id: "reservatorio", type: "rect", x: 6, z: -13, w: 17, d: 9, y: 1.5 },
    ],
    points: [
      {
        id: "complaint",
        x: -10,
        z: 4,
        title: "Nair / segunda ocorrência",
        text: "O café voltou, mas a água parou. Há um vazamento no anexo. Conferir a manutenção resolve mais que acusar alguém.",
        requires: [],
      },
      {
        id: "valve",
        x: 11,
        z: -12,
        title: "Válvula de manutenção",
        text: "Você fecha o desvio que alimentava a fonte decorativa. A rede da copa volta a ter pressão.",
        requires: ["complaint"],
      },
      {
        id: "report",
        x: -2,
        z: 10,
        title: "Relatório de serviço",
        text: "Falha de manutenção, nenhuma conspiração. Nair passa o café, a copa funciona e o novo caso termina sem live nem encaminhamentos.",
        requires: ["valve"],
      },
    ],
  },
};
export function buildExtraCase(world, id) {
  const definition = EXTRA_CASES[id];
  if (!definition) throw new Error("Caso desconhecido");
  world.disposeGroup(world.environment);
  world.environment = new world.THREE.Group();
  world.scene.add(world.environment);
  world.practice = true;
  world.obstacles = [];
  world.animated = [];
  world.npcs = [];
  world.environmentProps = [];
  world.cameraWalls = [];
  world.level = {
    ...definition,
    chapter: 1,
    name: definition.title,
    mobs: [
      { x: -100, z: -100 },
      { x: -110, z: -110 },
    ],
    boss: { x: -120, z: -120 },
    firstArena: { x: 0, z: 0, w: 0, d: 0 },
    bossArena: { x: 0, z: 0, w: 0, d: 0 },
    witness: definition.points[0],
    helper: definition.points[0],
    gatekeeper: definition.points[0],
    evidence: definition.points[0],
    sideItem: definition.points[0],
    collection: definition.points.at(-1),
  };
  world.scene.background.setHex(0xd9bb92);
  world.scene.fog.color.copy(world.scene.background);
  for (const s of definition.surfaces) {
    if (s.ramp)
      world.ramp(
        [
          [s.x - s.w / 2, 1.5, s.z - s.d / 2],
          [s.x + s.w / 2, 1.5, s.z - s.d / 2],
          [s.x + s.w / 2, 0, s.z + s.d / 2],
          [s.x - s.w / 2, 0, s.z + s.d / 2],
        ],
        0xbda887,
      );
    else world.box(s.x, s.y - 0.15, s.z, s.w, 0.3, s.d, 0xd3c3a1);
  }
  world.table(-5, 7);
  world.prop("coffeeCart", -7, 9);
  world.prop("planter", 8, 9);
  world.prop("bench", -9, 12);
  for (const point of definition.points) {
    const y = world.heightAt(point);
    const prop = world.prop(
      point.id === "valve" ? "valve" : "desk",
      point.x,
      point.z,
      {
        scale: 0.6,
      },
    );
    if (point.id === "valve") world.extraValve = prop.getObjectByName("wheel");
    const marker = world.marker(point);
    marker.userData.extraPoint = point.id;
    world.label(point.title, point.x, y + 2.8, point.z, 3.4);
  }
  const npc = createCharacterRig("nair");
  npc.root.position.set(2, 0, 5);
  world.environment.add(npc.root);
  world.prepareActor(npc);
  world.npcs = [{ name: "Dona Nair", x: 2, z: 5, model: npc }];
  if (id === "aftermath") {
    world.obstacle(2, 3.5, 0.3, 2, 2.8, 0xc8b697);
    world.obstacle(2, 10, 0.3, 3, 2.8, 0xc8b697);
    world.prop("lamp", 10, -16, { y: 1.5 });
    world.cylinder(7, 2.1, -13, 2, 2, 0.8, 0x618986);
  }
  return definition;
}
export const EXTRA_QUESTIONS = {
  "prologue:dock": {
    question: "Qual registro liga a carga ao próximo local?",
    clue: "A lista marca 37 pacotes às 06:25. A doca registra a transferência 37-B às 06:31.",
    answers: [
      ["document", "O documento 37-B e sua classificação como comunicação"],
      ["rumor", "Um comentário sem assinatura"],
      ["number", "O número de xícaras usadas"],
    ],
    correct: "document",
  },
  "interlude:board": {
    question: "Que prova identifica autoria, além de destino?",
    clue: "Manifesto: autorização. Roteiro: contrato. Original: assinatura e ordem de retenção.",
    answers: [
      [
        "original",
        "Mensagem original assinada, ligada ao manifesto e ao roteiro",
      ],
      ["copies", "Quantidade de cópias"],
      ["headline", "A thumbnail mais compartilhada"],
    ],
    correct: "original",
  },
  "aftermath:valve": {
    question: "Qual ligação deve ser fechada para recuperar a pressão?",
    clue: "A copa e o reservatório funcionam. Um desvio aberto leva água para a fonte decorativa.",
    answers: [
      ["branch", "Fechar o desvio da fonte e preservar a alimentação da copa"],
      ["tank", "Desligar o reservatório inteiro"],
      ["accuse", "Publicar uma acusação antes de conferir"],
    ],
    correct: "branch",
  },
};
