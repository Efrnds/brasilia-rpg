export const CHAPTERS = [
  {
    number: 1,
    title: "O Corredor das Emendas",
    area: "PRAÇA DO CAFEZINHO",
    palace: "PALÁCIO DO CAFEZINHO",
    subtitle: "PROTOCOLO OBRIGATÓRIO",
    patio: "PÁTIO DAS EMENDAS",
    prop: "CARIMBO OFICIAL",
    collectible: "MANIFESTO DE CARGA",
    item: "Carimbo oficial",
    clue: "Nota fiscal 37-B",
    npc: { witness: "Dona Nair", gatekeeper: "Assessor", helper: "Estagiário" },
    sideItem: "Pauta do dia",
    sideRequest:
      "A pauta perto dos bancos mistura manutenção e debate. A copa está vazando. Organize a prioridade correta e volto a trabalhar. Nair deixou uma garrafa para quem resolver o problema.",
    sideThanks:
      "Manutenção primeiro; a reunião pode esperar. A garrafa da Nair protege durante a cura. Ela também pode ajudar durante o encontro: use o comando de apoio.",
    witnessRole: "CHEFE DA COPA / SEM CAFÉ DESDE AS 06H",
    witnessText:
      "Sumiram com os 37 pacotes! Vi uma pilha de papel andando pro palácio. O assessor diz que sem carimbo ninguém entra. E tem mais: o café foi transferido como “material de comunicação”. Desde quando cafeína é assessoria de imprensa?",
    repeatText:
      "O manifesto está no pátio interno. Ele registra quem recebeu a carga. Se o assessor pedir protocolo, procure o carimbo nos achados e perdidos. Sem café, até o arquivo começou a discutir.",
    gateRole: "DIRETOR ADJUNTO DE PORTAS FECHADAS",
    gateText:
      "O manifesto? Está retido pelos Processos Pendentes. Para liberar: formulário 37-B, duas vias e um carimbo. Ou você enfrenta a papelada. Ela ganhou vida na falta de cafeína. O carimbo ficou nos achados e perdidos.",
    gateEvidenceText:
      "O carimbo oficial! Com ele eu arquivo os processos e libero o manifesto. A burocracia respeita muito um objeto com tinta. Mas o café já saiu daqui. Eu só sei disso administrativamente.",
    negotiation: "Protocolar o carimbo",
    combat: "Enfrentar a papelada",
    optional: "Procure o carimbo nos achados e perdidos.",
    objective: {
      investigate: "Converse com Dona Nair na praça.",
      permit: "Obtenha acesso com o assessor.",
      arena: "Derrote os dois Processos Pendentes.",
      boss: "Enfrente O Centrão no pátio interno.",
      coffee: "Leia o manifesto de carga no fundo do pátio.",
      complete: "Destino encontrado: sala de mídia.",
    },
    bossName: "O Centrão",
    bossRole: "SEIS BRAÇOS. QUATORZE COMISSÕES.",
    bossText:
      "Café é recurso estratégico. Está sob análise! Para liberar o manifesto, preciso de uma emenda, duas relatorias e um cargo que ainda não existe. Ou você pode tentar argumentar com meus seis braços.",
    bossHp: 270,
    mobHp: 65,
    attacks: [
      {
        name: "Emenda Relâmpago",
        radius: 3.6,
        center: "player",
        windup: 1.2,
        damage: 24,
        recovery: 1.7,
      },
      {
        name: "Comissão Especial",
        radius: 5.5,
        center: "boss",
        windup: 1.5,
        damage: 28,
        recovery: 2,
      },
    ],
    mobNames: ["Processo Pendente", "Processo Pendente"],
    clueText:
      "O manifesto revela uma transferência de 37 pacotes para a Sala de Mídia, autorizada pelo perfil “BomDia37”. O Centrão segurava a documentação, não o café. Alguém usou o roubo para fabricar uma crise e colocar uma live no ar.",
    transitionTitle: "O café virou conteúdo.",
    transitionText:
      "Dona Nair reconhece o código de entrega. A carga passou pelo estúdio. O assessor marca o endereço na sua pasta. É hora de descobrir quem está lucrando com a confusão.",
    next: "Ir à Câmara dos Cortes",
  },
  {
    number: 2,
    title: "A Câmara dos Cortes",
    area: "ESTÚDIO / SALA DE MÍDIA",
    palace: "CÂMARA DOS CORTES",
    subtitle: "AO VIVO. FORA DE CONTEXTO.",
    patio: "ESTÚDIO 37 / TRANSMISSÃO",
    prop: "VÍDEO ORIGINAL",
    collectible: "ROTEIRO DA LIVE",
    item: "Vídeo sem cortes",
    clue: "Roteiro da live e localização",
    npc: {
      witness: "Lia da Edição",
      gatekeeper: "Produtor",
      helper: "Técnico de Som",
    },
    sideItem: "Adaptador de áudio",
    sideRequest:
      "O adaptador perto do arquivo está ligado à saída errada. Refaça o caminho do microfone ao gravador. Meu fone reserva ajuda a perceber a preparação dos ataques; Lia poderá preparar sua resposta.",
    sideThanks:
      "Agora a fala chega ao gravador sem trilha por cima. Leve meu fone: interromper avisos recupera fôlego. Lia pode preparar um contra-ataque enquanto você continua a investigação.",
    witnessRole: "EDITORA / CORTARAM ATÉ O INTERVALO",
    witnessText:
      "Eu editei o vídeo da entrega. O original mostra as caixas indo para o Centro da Família. Na live, cortaram essa parte e disseram que o café sumiu por culpa de todo mundo. O perfil BomDia37 pagou a transmissão. Preciso do bruto para provar.",
    repeatText:
      "O vídeo original ficou no arquivo ao norte da recepção. Com ele, o produtor pode encerrar a live sem alimentar a treta. Sem ele, você vai ter que passar pelos bots e pelo dono do ring light.",
    gateRole: "PRODUTOR / MÉTRICAS ACIMA DE TUDO",
    gateText:
      "Uma crise sem café engaja muito. Não posso desligar a live com base em “a editora disse”. Traga o vídeo original ou resolva isso no palco. Os bots defendem a transmissão melhor que a nossa equipe de moderação.",
    gateEvidenceText:
      "O bruto mostra a entrega inteira. Se eu mantiver a live, minha thumbnail vira prova contra mim. Vou encerrar a transmissão e liberar o roteiro. O endereço do cliente está lá. Nunca achei que o contexto daria tanto trabalho.",
    negotiation: "Exibir o vídeo original",
    combat: "Interromper a live no palco",
    optional: "Recupere o vídeo sem cortes no arquivo.",
    objective: {
      investigate: "Ouça Lia da Edição.",
      permit: "Confronte o produtor com as evidências.",
      arena: "Desative os dois Bots de Engajamento.",
      boss: "Interrompa a live do Influencer Político.",
      coffee: "Leia o roteiro da transmissão.",
      complete: "Localização obtida: Centro da Família.",
    },
    bossName: "Influencer Político",
    bossRole: "AO VIVO / A VERDADE DÁ MENOS CLIQUES",
    bossText:
      "Se você veio buscar contexto, vai ter que assistir ao vídeo completo! E ninguém assiste ao vídeo completo. O café é só o gancho. A briga é o produto. Pessoal, comenta “CAFÉ” para impulsionar!",
    bossHp: 310,
    mobHp: 75,
    attacks: [
      {
        name: "Corte Fora de Contexto",
        radius: 2.9,
        center: "player",
        windup: 1.05,
        damage: 23,
        recovery: 1.5,
      },
      {
        name: "Ring Light Explosivo",
        radius: 6,
        center: "boss",
        windup: 1.5,
        damage: 30,
        recovery: 2.2,
      },
      {
        name: "Thumbnail Vermelha",
        radius: 4.2,
        center: "player",
        windup: 1.4,
        damage: 26,
        recovery: 1.8,
      },
    ],
    mobNames: ["Bot de Engajamento", "Manchete Ambulante"],
    clueText:
      "O roteiro registra o endereço do Centro da Família e a ordem: “Guardar o café até o grupo encaminhar a live para 37 contatos”. A crise foi montada pelo administrador BomDia37. Ele quer que todos repitam a história antes de liberar as caixas.",
    transitionTitle: "Encaminhado muitas vezes.",
    transitionText:
      "Lia entrega a mensagem original: o administrador é conhecido como Tio do Zap. A última entrega está no Centro da Família. Você leva a localização e o roteiro; agora precisa interromper a corrente antes que o café vire patrimônio do grupo.",
    next: "Entrar no Grupo da Família",
  },
  {
    number: 3,
    title: "O Grupo da Família",
    area: "CENTRO DA FAMÍLIA",
    palace: "GRUPO DA FAMÍLIA",
    subtitle: "ENCAMINHADO MUITAS VEZES",
    patio: "DEPÓSITO DE BOM DIA",
    prop: "MENSAGEM ORIGINAL",
    collectible: "37 PACOTES DE CAFÉ",
    item: "Mensagem original do grupo",
    clue: "Café recuperado e registro da corrente",
    npc: {
      witness: "Prima Célia",
      gatekeeper: "Administrador Adjunto",
      helper: "Sobrinho da Informática",
    },
    sideItem: "Roteador do centro",
    sideRequest:
      "O retorno do relé está reenviando cada cópia para a origem. Interrompa só esse retorno, preserve a assinatura e conte o resultado. Um crachá da manutenção e meu apoio ajudam na travessia.",
    sideThanks:
      "A mensagem original ficou preservada, e a corrente parou de se alimentar. O crachá reduz o custo da defesa; posso recuperar seu fôlego durante os encontros.",
    witnessRole: "PRIMA CÉLIA / SILENCIOU POR UM ANO",
    witnessText:
      "O tio guardou o café para obrigar o grupo a compartilhar a live. Disse que era uma campanha para “acordar o país”. Eu falei que podia só passar o café. A mensagem original está no mural; ela mostra o plano e tem a senha do depósito.",
    repeatText:
      "Com a mensagem original, o administrador adjunto consegue abrir o depósito e encerrar a corrente. Sem ela, o tio vai querer resolver tudo por áudio. Ele nunca manda um áudio curto.",
    gateRole: "ADMINISTRADOR ADJUNTO / SEM PODER DE BANIR",
    gateText:
      "Para chegar ao depósito, preciso da mensagem que autorizou a campanha. A senha está nela. Ou você enfrenta as correntes e fala com o tio pessoalmente. Aqui, toda frase termina com “repasse”.",
    gateEvidenceText:
      "A mensagem tem a senha e prova que a corrente começou aqui. Vou fechar o encaminhamento automático e abrir o depósito. O tio vai ter que explicar isso na reunião, sem ring light e sem áudio acelerado.",
    negotiation: "Usar a mensagem e encerrar a corrente",
    combat: "Enfrentar o Tio do Zap",
    optional: "Encontre a mensagem original no mural.",
    objective: {
      investigate: "Converse com Prima Célia.",
      permit: "Encontre uma entrada para o depósito.",
      arena: "Rompa as Correntes Infinitas.",
      boss: "Interrompa os encaminhamentos do Tio do Zap.",
      coffee: "Recupere os 37 pacotes no depósito.",
      complete: "O café voltou. Decida como encerrar a história.",
    },
    bossName: "Tio do Zap",
    bossRole: "ADMINISTRADOR BOMDIA37 / DIGITANDO…",
    bossText:
      "Eu só queria que todo mundo prestasse atenção! Ninguém lia minhas mensagens. Então eu escondi o café e contratei a live. Funcionou: agora todo mundo está falando! Só falta encaminhar para mais 37 pessoas…",
    bossHp: 360,
    mobHp: 80,
    attacks: [
      {
        name: "Áudio de Sete Minutos",
        radius: 3.2,
        center: "player",
        windup: 1.3,
        damage: 27,
        recovery: 1.7,
      },
      {
        name: "Bom Dia com Flor",
        radius: 6.2,
        center: "boss",
        windup: 1.65,
        damage: 30,
        recovery: 2.1,
      },
      {
        name: "Encaminhar para 37 Grupos",
        radius: 4.2,
        center: "player",
        windup: 1.35,
        damage: 28,
        recovery: 1.8,
      },
    ],
    mobNames: ["Corrente Infinita", "Áudio Interminável"],
    clueText:
      "Os 37 pacotes estão intactos. O registro do depósito confirma o plano: fabricar a falta, vender a crise e exigir encaminhamentos. Com o café e as provas na mão, você pode encerrar o caso sem esconder como ele começou.",
  },
];
export const chapterContent = (state) => CHAPTERS[state.chapter - 1];
export function campaignEnding(state, decision) {
  const evidence = state.history.filter((h) => h.evidence).length;
  const agreements = state.history.filter(
    (h) => h.route === "negotiated",
  ).length;
  const completeProof = evidence === 3;
  if (decision === "mediate")
    return {
      title: "Uma mesa. Nenhum encaminhamento.",
      type: "Conciliação",
      text: `Você reúne Dona Nair, Lia, Célia e o tio. ${state.history.filter((h) => h.helped).length >= 2 ? "A equipe que você ajudou traz os registros e prepara a devolução. " : ""} ${completeProof ? "As três provas deixam o percurso da carga claro, sem espaço para versões editadas." : "O manifesto e o roteiro comprovam o roubo; os detalhes que faltam entram como perguntas, não acusações."} O tio admite que trocou uma conversa por uma corrente. Devolve o café e aceita ficar fora da administração do grupo. ${agreements >= 2 ? "Os acordos anteriores ajudam a encerrar a crise sem uma nova disputa." : "Nem todo mundo sai amigo, mas a copa volta a funcionar e os encaminhamentos param."} Dona Nair impõe a regra final: a próxima reunião só começa depois da primeira xícara.`,
    };
  if (state.polarization >= 75)
    return {
      title: "Café quente. Debate fervendo.",
      type: "Repercussão",
      text: `Você publica o percurso das 37 caixas. ${completeProof ? "Carimbo, vídeo bruto e mensagem original sustentam cada parte da história." : "As provas obrigatórias mostram o plano, mas alguns trechos ainda precisam de contexto."} O roubo acaba, o tio perde a administração e o influencer precisa corrigir a live. A repercussão, porém, alimenta uma nova disputa: cada grupo escolhe o próprio culpado favorito. Lia mantém o material completo acessível. Dona Nair desliga as notificações e passa o café. A carga foi recuperada; agora o país precisa aprender a ler antes de encaminhar.`,
    };
  return {
    title: "Contexto servido com café.",
    type: "Esclarecimento",
    text: `Você publica uma linha do tempo com documentos, sem cortes dramáticos. ${completeProof ? "As três provas fecham todas as pontas: autorização, manipulação da live e ordem de encaminhamento." : "O manifesto e o roteiro fecham o caso; Lia e Célia ajudam a explicar os trechos sem registro original."} O tio devolve a chave do depósito, o produtor encerra a campanha e os assessores deixam de tratar café como material de comunicação. ${agreements ? "Quem colaborou recebe espaço para explicar o ocorrido, sem apagar sua responsabilidade." : "Depois dos confrontos, as provas ajudam a evitar outra rodada de acusações."} No gabinete, Dona Nair recupera o expediente. Pela primeira vez, o grupo recebe um “bom dia” sem pedido de repasse.`,
  };
}
