export const CASES = {
  1: {
    question: "Como o carimbo ajuda a investigação?",
    clue: "O assessor retém documentos. Dona Nair viu uma transferência registrada como material de comunicação.",
    answers: [
      [
        "a",
        "Ele autoriza o acesso ao manifesto; o destino ainda precisa ser conferido.",
      ],
      ["b", "Ele prova que o café está na praça."],
      ["c", "Ele identifica sozinho quem roubou o café."],
    ],
    correct: "a",
    explanation:
      "Autorização de acesso e prova de autoria são coisas diferentes.",
  },
  2: {
    question: "Qual trecho foi retirado da transmissão?",
    clue: "Bruto: entrega às 06:31, nota 37-B; caminhão às 06:37, Centro da Família. Live: somente discussão às 06:42.",
    answers: [
      ["a", "A discussão de 06:42."],
      ["b", "A entrega e o destino da carga antes da discussão."],
      ["c", "Uma propaganda de café depois da live."],
    ],
    correct: "b",
    explanation:
      "O corte escondeu o destino da carga para fabricar um desaparecimento.",
  },
  3: {
    question: "Qual registro revela a origem da corrente?",
    clue: "Origem às 06:37: BomDia37 pede guardar o café até receber 37 encaminhamentos. Cópias posteriores ocultam a assinatura.",
    answers: [
      ["a", "A cópia mais encaminhada."],
      ["b", "O último áudio do grupo."],
      ["c", "A mensagem assinada por BomDia37 às 06:37."],
    ],
    correct: "c",
    explanation: "Popularidade de uma cópia não comprova origem.",
  },
};
export const EDIT_STEPS = [
  {
    question: "Reconstrua o vídeo: qual evento vem primeiro?",
    clue: "Arquivo 37-B: 06:31 entrega · 06:37 saída do caminhão · 06:42 discussão.",
    answers: [
      ["delivery", "Entrega das caixas na doca"],
      ["argument", "Discussão no estúdio"],
      ["truck", "Saída do caminhão"],
    ],
    correct: "delivery",
  },
  {
    question: "Qual evento liga a entrega ao destino?",
    clue: "A câmera da doca registra a placa e a rota às 06:37.",
    answers: [
      ["truck", "Caminhão segue para o Centro da Família"],
      ["argument", "Apresentador começa a discutir"],
      ["ad", "Propaganda entra no ar"],
    ],
    correct: "truck",
  },
  {
    question: "Como concluir o vídeo preservando o contexto?",
    clue: "A discussão ocorreu depois que a carga já tinha saído.",
    answers: [
      ["argument", "Manter a discussão depois da entrega e da saída"],
      ["cut", "Começar pela discussão e esconder a doca"],
      ["repeat", "Repetir a acusação três vezes"],
    ],
    correct: "argument",
  },
];
export const NETWORK_STEPS = [
  {
    question: "Primeiro reparo: como interromper o ciclo?",
    clue: "A rede é Origem → Relé → Grupo. O Relé está devolvendo cópias para a Origem.",
    answers: [
      ["relay", "Desligar o retorno do Relé para a Origem"],
      ["origin", "Apagar a mensagem original"],
      ["all", "Ligar todos os encaminhamentos"],
    ],
    correct: "relay",
  },
  {
    question: "Com o retorno desligado, qual registro preservar?",
    clue: "O arquivo assinado contém a ordem e a senha do depósito.",
    answers: [
      ["copy", "A cópia sem autor"],
      ["origin", "A mensagem assinada antes dos encaminhamentos"],
      ["audio", "Um áudio de sete minutos"],
    ],
    correct: "origin",
  },
];
export const SIDE_TASKS = {
  1: {
    question: "Organize a pauta para liberar a copa.",
    clue: "A torneira está vazando; discutir o formato da reunião pode esperar.",
    answers: [
      ["repair", "Manutenção primeiro, reunião depois"],
      ["debate", "Debate sobre a pauta primeiro"],
      ["cancel", "Ignorar o vazamento"],
    ],
    correct: "repair",
  },
  2: {
    question: "Repare o caminho de áudio do estúdio.",
    clue: "O microfone deve passar pelo adaptador para chegar ao gravador. A trilha não pode substituir a fala.",
    answers: [
      ["voice", "Microfone → adaptador → gravador"],
      ["music", "Trilha dramática → gravador"],
      ["loop", "Gravador → microfone → gravador"],
    ],
    correct: "voice",
  },
  3: NETWORK_STEPS[0],
};
export const PROOF_NOTES = {
  1: "Carimbo de acesso: autoriza conferir o manifesto, mas não identifica o destino. Nair viu uma transferência como material de comunicação.",
  2: "Vídeo bruto: 06:31 entrega, 06:37 caminhão para o Centro da Família, 06:42 discussão. A live omitiu a entrega e a rota.",
  3: "Mensagem original: BomDia37, 06:37, ordem de reter o café até 37 encaminhamentos. Inclui senha do depósito e assinatura.",
};
export function evaluateAnswer(question, answer) {
  return (
    question.answers.some(([id]) => id === answer) &&
    question.correct === answer
  );
}
export function evidenceConnections(state) {
  const lines = [];
  if (state.history.length >= 1)
    lines.push(
      "Manifesto 37-B → Sala de Mídia: transferência de 37 pacotes autorizada por BomDia37.",
    );
  if (state.history.length >= 2)
    lines.push(
      "Roteiro da live → Centro da Família: crise vendida antes da devolução da carga.",
    );
  if (state.stamp) lines.push(PROOF_NOTES[state.chapter]);
  if (state.history.length === 3)
    lines.push(
      "Depósito → BomDia37: o café não desapareceu; foi retido para obrigar compartilhamentos.",
    );
  return lines;
}
