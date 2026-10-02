# Plano de melhorias — Brasília: O Último Debate

Base: código e documentação da v0.4, revisados em 02/10/2026. Este documento orienta a próxima implementação; nenhuma tarefa abaixo deve ser considerada concluída por estar planejada.

## Diagnóstico e objetivo

O jogo já tem três plantas diferentes, dois protagonistas, campanha concluível, efeitos de combate, saves e um pack de dez objetos. Isso demonstra funcionamento, mas ainda não comprova qualidade de controle, composição visual, desafio ou narrativa. A crítica do jogador é a referência principal: repetição, objetos artificiais e pouca clareza das ações.

Pontos confirmados na inspeção:

- `src/content.js` repete testemunha → porteiro → prova ou combate → chefe → documento nos três capítulos. As tarefas de apoio são buscas de um objeto com a mesma recompensa.
- Os ataques dos chefes variam em valores e nomes, mas seguem sobretudo duas regras: círculo no jogador ou círculo no inimigo. Não há mecânica exclusiva completa por chefe.
- `src/domain.js` oferece apenas vida ou dano como escolhas permanentes. O nível deriva dessas escolhas; não existe um sistema amplo de especialização ou equipamento.
- `src/world.js` anima membros por transformações procedurais. Não há pipeline de rig e clips autorais, contatos de pés ou transições completas.
- `assets/pack/props.js` contém dez objetos reutilizáveis. O pack ainda não cobre arquitetura, portas funcionais, conjunto de materiais, animações de props ou variantes suficientes para toda a campanha.
- `src/audio.js` usa efeitos sintetizados e um volume geral. Não há música, ambientação contínua ou mixagem espacial completa.
- `src/main.js` concentra entrada, interfaces, simulação, encontros e câmera. Isso dificulta ampliar e ajustar sistemas independentemente.
- Os testes de integração usam renderer substituto e teletransportam o jogador para testar interações. Confirmam regras e fluxos; não demonstram que os percursos, a câmera ou a imagem funcionam bem numa sessão normal.
- A documentação original contém propostas antigas de motor e escopo. Ela precisa distinguir histórico de plano vigente.

Decisões mantidas: PC no navegador, terceira pessoa, combate em tempo real, português, Luli e Folfonaro ficcionais. Direção visual delegada: comédia física em 3D estilizado. Campanha individual nesta etapa. Não trocar o motor apenas por preferência: avaliar necessidades concretas do projeto atual primeiro.

Objetivo da próxima versão: uma primeira fase que seja agradável de jogar e visualmente coerente, validada por pessoas, antes de multiplicar seu custo por novas campanhas.

## Como ler o backlog

**P0:** necessário para validar a experiência básica. **P1:** necessário para elevar a campanha existente. **P2:** expansão ou acabamento posterior. As prioridades não são severidades de bugs: vários itens são funcionalidades novas.

**P / M / G:** esforço relativo pequeno, médio ou grande. Não são prazos. Arte, áudio, testes e retrabalho entram na estimativa futura.

**C:** lacuna confirmada no código/conteúdo. **R:** problema relatado pelo jogador cuja correção precisa ser conferida jogando. **V:** hipótese a validar em navegador real. Um item pode combinar origens.

Cada linha abaixo tem uma entrega própria e uma condição observável de conclusão. Na revisão inicial, os 88 itens começaram **pendentes**; recursos parciais já existentes servem de base. O registro de execução ao final identifica os itens atualmente em andamento ou validação.

## 1. Controle, movimento e câmera — 8 itens

| ID | Prioridade / esforço / origem | Melhoria planejada | Critério de conclusão |
| --- | --- | --- | --- |
| 01 | P0 / M / V | Ajustar aceleração, desaceleração e giro; impedir que direção do movimento desfaça a preparação de uma ação. | Percurso de teste com curvas, parada e ataque em movimento responde previsivelmente; parâmetros ficam configuráveis. |
| 02 | P0 / G / V | Refazer câmera de interiores, com varredura de volume e recuperação suave após obstáculos. | Um percurso contínuo por todos os corredores e portas mantém jogador e caminho visíveis, sem atravessar paredes. |
| 03 | P0 / M / V | Tratar enquadramento em rampas e passarelas: altura do alvo, distância e limites verticais. | Subir e descer as duas áreas elevadas não oculta destino nem provoca mudança abrupta de enquadramento. |
| 04 | P1 / M / C | Criar seleção opcional de alvo, troca de alvo e liberação automática fora de alcance. | Jogador seleciona e troca inimigos sem prender câmera em alvo morto ou distante. |
| 05 | P0 / M / V | Padronizar raio do personagem, colisões e deslizamento em quinas, móveis e portas. | Passagens obrigatórias têm folga mensurada; não existem pontos de aprisionamento no percurso gravado. |
| 06 | P1 / P / C | Incluir corrida com regra clara de Fôlego e interrupção por ações de combate. | Corrida reduz tempo de travessia sem permitir regeneração ou defesa incompatíveis com a regra publicada. |
| 07 | P0 / M / V | Introduzir buffer curto de entrada para ataques e esquiva, com janela de cancelamento declarada. | Comando feito perto do fim de uma recuperação executa uma vez; spam não cria ações extras ou cura indevida. |
| 08 | P1 / M / C | Separar sensibilidade horizontal/vertical, inversão de eixos, FOV e modos de captura do mouse. | Alterações persistem; arrastar e usar setas permite concluir a fase quando pointer lock está indisponível. |

## 2. Combate e leitura de impacto — 8 itens

| ID | Prioridade / esforço / origem | Melhoria planejada | Critério de conclusão |
| --- | --- | --- | --- |
| 09 | P0 / G / R | Sincronizar alcance, janela de acerto e trajetória visual da arma; distinguir golpe frontal de habilidade em área. | Na arena de teste, impactos acontecem na passagem da arma, respeitam parede/altura e atingem cada alvo uma vez por golpe. |
| 10 | P0 / M / R | Consolidar acerto, erro, defesa e dano recebido com sinais visuais e sonoros distintos. | Jogadores identificam os quatro resultados sem ler o HUD; efeitos não escondem o próximo ataque. |
| 11 | P0 / M / R | Implementar reação de inimigos a impacto, com interrupções e resistências explícitas. | Inimigo comum reage quando atingido; chefe comunica resistência; nenhuma sequência causa atordoamento infinito. |
| 12 | P0 / M / V | Ajustar alcance, duração e custo da esquiva; alinhar proteção à animação e ao deslocamento. | A janela protegida é verificável no cenário de teste; atravessar parede ou esquivar sem recurso é impossível. |
| 13 | P1 / M / C | Fazer defesa ter postura própria, quebra de guarda e resposta ao bloqueio bem-sucedido. | Dano frontal/lateral, custo e quebra correspondem às regras; bloqueio bem-sucedido oferece resposta curta legível. |
| 14 | P0 / M / C | Dar efeitos e tempos próprios às oito habilidades, incluindo conjuração e recuperação. | Cada habilidade tem função reconhecível, animação compatível e custo aplicado uma única vez; não é só outro pulso circular. |
| 15 | P1 / M / C | Rever cura e restauração entre encontros; tornar a carga extra útil sem transformar toda luta em espera. | As duas rotas e personagens concluem a fase sem cura infinita; a política de restauração aparece na interface. |
| 16 | P0 / M / V | Balancear dano, vida, Fôlego, recargas e duração dos encontros com sessões registradas. | Tabela de balanceamento inclui tempo de luta, derrotas e habilidades usadas; dificuldade não depende apenas de vida inflada. |

## 3. Level design e exploração — 8 itens

| ID | Prioridade / esforço / origem | Melhoria planejada | Critério de conclusão |
| --- | --- | --- | --- |
| 17 | P0 / G / R | Projetar a primeira fase como percurso completo: chegada, orientação, descoberta, tensão, clímax e saída. | Planta anotada explica a função de cada espaço; sessão sem teleporte consegue mostrar cada momento. |
| 18 | P1 / G / R | Fazer do estúdio uma fase sobre bastidores, controle de transmissão e verticalidade. | Pelo menos uma solução exige usar edição/equipamento do estúdio; a fase não repete a primeira com outra decoração. |
| 19 | P1 / G / R | Fazer do jardim uma fase sobre conexões, circulação entre ilhas e interrupção de correntes. | Pontes, mural e atalho criam decisões diferentes; há alternativa segura e o retorno é compreensível. |
| 20 | P0 / M / V | Substituir dependência de placas enormes e setas por marcos visuais, luz, enquadramento e arquitetura. | Jogadores encontram o primeiro objetivo com minimapa desligado; sinalização reforça orientação sem cobrir tudo de texto. |
| 21 | P0 / M / R | Desenhar arenas para os ataques existentes: cobertura, linhas de visão e área de escape. | Todo ataque obrigatório tem pelo menos uma resposta alcançável a partir de posições válidas, inclusive perto de bordas. |
| 22 | P1 / M / C | Adicionar interações ambientais úteis: console, porta, arquivo, válvula ou equipamento ligado à missão. | Cada interação altera rota, encontro ou informação; objetos de aparência interativa seguem regra consistente. |
| 23 | P1 / M / C | Colocar segredos e atalhos com recompensa própria e acesso permanente após descoberta. | Descoberta melhora uma escolha ou percurso; jogador entende como abriu o atalho e não perde acesso ao salvar. |
| 24 | P0 / M / V | Ajustar densidade, tempo de caminhada e retorno depois dos encontros. | Sessões medem trechos sem decisão; áreas vazias têm função explícita e revisões reduzem travessia sem conteúdo. |

## 4. Inimigos, IA e chefes — 8 itens

| ID | Prioridade / esforço / origem | Melhoria planejada | Critério de conclusão |
| --- | --- | --- | --- |
| 25 | P1 / M / C | Criar papéis distintos para inimigos comuns: perseguidor, atacante distante e suporte. | Silhueta e comportamento revelam o papel; cada combinação pede uma prioridade de alvo diferente. |
| 26 | P0 / G / V | Melhorar navegação em portas, obstáculos e desníveis; definir retorno e recuperação quando bloqueado. | IA percorre rotas válidas, não se acumula numa quina e não persegue através de áreas proibidas. |
| 27 | P0 / M / V | Coordenar ataques por oportunidade e espaço disponível, evitando combinações inevitáveis. | Replays de encontros com dois ou mais inimigos mostram uma janela de resposta; avisos simultâneos seguem regra documentada. |
| 28 | P0 / M / R | Produzir sinais corporais específicos para cada tipo de ataque e progressão do aviso no chão. | Preparação permite distinguir ataque antes do impacto, inclusive sem som; indicador espacial corresponde ao alcance real. |
| 29 | P1 / G / C | Dar ao Centrão uma mecânica de braços/comissões, com objetivos de interrupção distintos. | Jogador pode desativar uma ação pelo braço ou pela documentação; isso muda padrões e oportunidade de dano. |
| 30 | P1 / G / C | Dar ao Influencer mecânica de audiência, câmeras e transmissão, com manipulação do cenário. | Desativar equipamentos altera ataques e força; a luta exige mais que evitar círculos e reduzir vida. |
| 31 | P1 / G / C | Dar ao Tio do Zap fases ligadas a encaminhamentos, conexões e reforços interrompíveis. | Mudança de fase tem sinal próprio; impedir uma corrente modifica os reforços; existe limite claro de invocação. |
| 32 | P1 / M / C | Fazer IA e fala reconhecerem prova obtida, negociação anterior e faixa de polarização. | Pelo menos uma alteração verificável por capítulo acompanha uma escolha; o save conserva essa consequência. |

## 5. Direção de arte e pack de assets — 8 itens

| ID | Prioridade / esforço / origem | Melhoria planejada | Critério de conclusão |
| --- | --- | --- | --- |
| 33 | P0 / M / R | Produzir amostra de arte: protagonista, inimigo, móvel, parede e trecho iluminado sob uma mesma direção. | A amostra é vista em câmera de jogo e aprovada visualmente antes de ampliar o pack; proporções e acabamento combinam. |
| 34 | P0 / G / R | Remodelar Luli e Folfonaro com silhueta, rosto, mãos, roupa e acessórios próprios. | Reconhecimento funciona de frente/costas e em distância de combate; diferenças vão além de cor e barba. |
| 35 | P1 / G / R | Remodelar inimigos com construção coerente, pontos de articulação e materiais reconhecíveis. | Anatomia/estrutura explica movimento e ataque; nome e função não dependem de etiqueta flutuante. |
| 36 | P0 / M / R | Refinar os dez props atuais: escala, bordas, espessura, fixação, contato com chão e variantes. | Mesa, cadeira, câmera, banco e estante parecem utilizáveis na mesma escala; comparativo visual documenta correções. |
| 37 | P1 / G / C | Expandir kit arquitetônico: paredes, cantos, portas, caixilhos, pisos, escadas, rampas e corrimãos. | Um cômodo completo monta com módulos sem frestas; colisão e passagem de câmera correspondem à geometria. |
| 38 | P0 / M / R | Criar biblioteca pequena de materiais: concreto, madeira, metal, tecido, papel, vidro e vegetação. | Materiais se distinguem sob a mesma luz; escala de textura e rugosidade não mudam arbitrariamente entre modelos. |
| 39 | P1 / M / C | Padronizar pack com variantes, dimensões, pivôs, colisores e exports portáveis, incluindo GLB. | Arquivos importam numa cena limpa; manifesto registra versão, origem, licença, escala e referência de colisão. |
| 40 | P0 / M / R | Fazer passe de composição por área: luz, contraste, profundidade e decoração ligada ao uso do lugar. | Capturas de câmera de jogo mostram foco e navegação; props não flutuam, atravessam paredes ou ocupam passagens sem motivo. |

## 6. Animação e efeitos — 8 itens

| ID | Prioridade / esforço / origem | Melhoria planejada | Critério de conclusão |
| --- | --- | --- | --- |
| 41 | P0 / G / R | Preparar rig reutilizável e clips autorais para locomoção e ações básicas. | Um personagem executa todos os clips sem deformação indevida; formato e ferramenta de autoria ficam documentados. |
| 42 | P0 / M / R | Criar transições entre repouso, andar, correr, atacar, defender, esquivar e sofrer dano. | Troca de estado não causa salto de pose; ação tem precedência e cancela apenas nas janelas definidas. |
| 43 | P1 / M / V | Corrigir contato dos pés em piso/rampa e relacionar velocidade da passada ao deslocamento. | Subida, descida e parada não apresentam deslizamento evidente ou pés atravessando o chão. |
| 44 | P1 / M / C | Animar NPCs e props funcionais com gestos coerentes: olhar, conversar, escrever, abrir e operar. | Atividade tem posição e objeto correspondentes; NPC não executa o mesmo balanço sem relação com sua função. |
| 45 | P0 / M / R | Distinguir impacto em papel, metal, humano e chão por partículas, marcas e som. | Superfície determina efeito; sangue estilizado permanece nos alvos compatíveis e pode ser desativado. |
| 46 | P0 / M / V | Limitar tremor, pausa de impacto e clarões; definir limites e controle independente. | Impactos múltiplos não congelam indefinidamente a ação nem escondem avisos; configurações realmente reduzem os efeitos. |
| 47 | P1 / M / R | Elaborar morte, vitória, recuperação e desaparecimento com limpeza visual. | Corpos têm reação coerente e encerramento; recompensa não interrompe a última pose; objetos não somem no instante do golpe. |
| 48 | P1 / M / C | Criar entrada e encerramento curtos dos chefes usando enquadramento e animação do próprio cenário. | Cena comunica ameaça/conclusão, pode ser pulada e não prende o jogador ou reaplica recompensas ao retomar. |

## 7. História, missões e expansão — 8 itens

| ID | Prioridade / esforço / origem | Melhoria planejada | Critério de conclusão |
| --- | --- | --- | --- |
| 49 | P0 / M / R | Escrever uma bíblia curta: regras do mundo, motivo do roubo, cadeia de provas, personagens e resolução. | Toda pista tem origem, revela algo novo e sustenta o final; não há informação crucial contraditória entre capítulos. |
| 50 | P1 / G / C | Dar arco próprio a cada capítulo e quebrar o ciclo repetido de testemunha/porteiro/busca/luta. | Diagramas de missão mostram estruturas diferentes e pelo menos uma virada jogável por capítulo. |
| 51 | P1 / M / C | Diferenciar voz, motivação e respostas de Luli e Folfonaro sem transformar cada fala em bordão. | Cena equivalente muda diálogo e abordagem mantendo as mesmas informações necessárias para prosseguir. |
| 52 | P0 / M / C | Projetar uma rota de negociação com desafio e descoberta próprios. | Negociar exige decisão ou dedução e oferece conteúdo de qualidade comparável; não só apaga todas as lutas após buscar um objeto. |
| 53 | P1 / G / C | Substituir tarefas de coleta repetidas por investigação, reparo, conversa e resolução ambiental. | Cada capítulo tem missão secundária com verbo próprio e recompensa diferente de outra carga de cura. |
| 54 | P1 / M / C | Retomar NPCs e acontecimentos em capítulos posteriores com mudanças observáveis. | Ao menos uma ação anterior altera presença, ajuda ou fala; o jogador reconhece a causa sem explicação externa. |
| 55 | P1 / M / C | Reescrever finais a partir de provas, decisões, ajuda e polarização, com cena de retorno do café. | Combinações principais produzem consequências coerentes; recuperar os pacotes tem resolução visual além de texto. |
| 56 | P2 / G / C | Planejar expansão em módulos: prólogo jogável na copa, interlúdio de investigação e caso posterior independente. | Cada módulo tem pergunta, mapa, mecânica e conclusão próprios; implementação só começa após os três capítulos atuais passarem pelos critérios da campanha. |

## 8. Sistemas de RPG e rejogabilidade — 8 itens

| ID | Prioridade / esforço / origem | Melhoria planejada | Critério de conclusão |
| --- | --- | --- | --- |
| 57 | P1 / M / C | Trocar escolhas genéricas de vida/dano por especializações curtas com efeitos funcionais. | Duas escolhas do mesmo protagonista alteram como se joga e ambas concluem a campanha. |
| 58 | P1 / M / C | Permitir equipar quatro habilidades entre um conjunto enxuto, com descrição e teste antes da escolha. | Troca funciona num ponto seguro; save conserva configuração; o jogador entende custo, efeito e alcance. |
| 59 | P1 / M / C | Introduzir poucos equipamentos autorais, com função e origem narrativa. | Cada peça modifica uma decisão ou habilidade; não há dezenas de itens que só mudam porcentagens. |
| 60 | P1 / M / C | Fazer polarização gerar caminhos de risco e retorno, incluindo vantagens da faixa alta. | Estratégias em faixas baixa/alta são viáveis e têm consequências anunciadas; faixa alta não é somente penalidade. |
| 61 | P1 / M / C | Definir recompensas exclusivas para negociação, investigação e combate sem punir uma abordagem. | Todas as rotas ganham ferramentas úteis e acesso à continuação; a comparação aparece na tabela de recompensas. |
| 62 | P2 / M / C | Criar apoio de um NPC aliado ligado a missões, com uma função simples e recarga. | A ajuda responde à missão e ao posicionamento; não substitui combate nem bloqueia portas. |
| 63 | P1 / P / C | Mostrar ficha útil com efeitos reais, melhorias acumuladas e regras de restauração. | Todo atributo exibido participa das regras e números apresentados correspondem ao estado atual. |
| 64 | P2 / M / C | Oferecer repetição de encontro concluído e desafio curto para experimentar builds. | Acesso não sobrescreve a campanha, não duplica recompensas e mede desempenho com regras conhecidas. |

## 9. Áudio e atmosfera — 8 itens

| ID | Prioridade / esforço / origem | Melhoria planejada | Critério de conclusão |
| --- | --- | --- | --- |
| 65 | P0 / M / R | Criar pack de sons de ação com diferenças entre ar, papel, metal, corpo, defesa e habilidades. | Eventos sincronizam com animação/acerto; volumes relativos mantêm alertas inteligíveis. |
| 66 | P1 / M / C | Adicionar passos por superfície e eventos para subida, esquiva e parada. | Som segue contato/velocidade, muda com piso e para quando jogador ou simulação param. |
| 67 | P1 / M / C | Criar paisagem sonora própria por fase: copa/arquivo, equipamentos de estúdio e jardim/depósito. | Identidade pode ser reconhecida sem música; loops não têm cortes audíveis nem volume cansativo. |
| 68 | P1 / G / C | Produzir trilha pequena com temas de exploração e combate por capítulo. | Transições não cortam abruptamente; música respeita pausa e nenhum capítulo usa um loop genérico único. |
| 69 | P0 / M / R | Desenhar avisos sonoros exclusivos de perigos e chefes. | Ataque é reconhecível pelo sinal sonoro; todos os sinais também têm equivalente visual. |
| 70 | P1 / M / C | Usar posição, distância e limites de simultaneidade para fontes de som. | Fonte lateral soa na direção correta; numerosos impactos não saturam nem criam crescimento ilimitado de vozes. |
| 71 | P0 / P / C | Separar volume geral, música, efeitos e ambientação, com mudo e teste de volume. | Configurações persistem e atuam em sons já tocando; áudio inicia apenas após ação do usuário. |
| 72 | P1 / M / C | Registrar autoria/licenças, normalização e exports do pack sonoro; incluir eventos de interface próprios. | Todo arquivo tem origem registrada; menus, coleta e confirmação soam distintos; picos não clipam no mix final. |

## 10. Interface, entendimento e acessibilidade — 8 itens

| ID | Prioridade / esforço / origem | Melhoria planejada | Critério de conclusão |
| --- | --- | --- | --- |
| 73 | P0 / M / V | Reduzir disputa visual entre objetivo, dock, vida, avisos e barra de chefe. | Combate permanece visível em 1280×720 e 1920×1080; alertas importantes têm ordem clara e não se sobrepõem. |
| 74 | P0 / M / C | Criar tutorial breve no mundo para ataque, esquiva, defesa, prova e negociação. | Jogador novo consegue demonstrar as ações sem abrir manual; quem já sabe pode pular e consultar depois. |
| 75 | P1 / M / C | Reorganizar diário como investigação: pergunta atual, pistas, origem e relações entre provas. | Jogador retomando save entende o caso e próximo passo; diário evita reproduzir apenas o texto do HUD. |
| 76 | P0 / M / V | Melhorar minimapa com legenda, orientação, andar/altura, portas e objetivo por símbolo. | Pontos não dependem só de cor; o mapa não sugere acesso a rota ainda fechada; desníveis são distinguíveis. |
| 77 | P1 / M / C | Ajustar diálogo: ritmo, histórico, respostas do personagem e retorno ao contexto de jogo. | Texto essencial não é perdido por clique; foco e pointer lock retornam corretamente; opções longas continuam legíveis. |
| 78 | P0 / M / C | Implementar remapeamento, navegação por teclado e verificação de foco de menus/modais. | Controles alterados aparecem nos prompts; conflitos são tratados; todo menu opera sem mouse. |
| 79 | P0 / M / V | Oferecer escala de texto/HUD, contraste adequado e alternativas a informação exclusivamente colorida. | Zoom e texto maior não cortam opções; estado de habilidade e perigo se entende por forma/texto além da cor. |
| 80 | P0 / M / C | Separar opções de tremor, flashes, pausa de impacto e sangue; ampliar assistência de dificuldade. | Efeitos podem ser reduzidos independentemente; ajuda altera janelas/dano com explicação, mantendo a mesma história. |

## 11. Engenharia, testes e entrega — 8 itens

| ID | Prioridade / esforço / origem | Melhoria planejada | Critério de conclusão |
| --- | --- | --- | --- |
| 81 | P0 / G / C | Extrair de `main.js` entrada, câmera, encontros e UI; usar eventos explícitos entre regras e apresentação. | Mudança numa habilidade não exige editar controle/câmera; sessões encerradas não recebem callbacks ou recompensas antigas. |
| 82 | P0 / M / C | Separar simulação de renderização com passo fixo, acumulador limitado e RNG controlável nos testes. | Mesma entrada produz resultados equivalentes em 30/60/120 fps; pausa de impacto não altera duração de recarga indevidamente. |
| 83 | P0 / M / C | Formalizar schema/migrações de save e adicionar slots com checkpoint identificado por conteúdo. | Saves antigos migram; arquivo inválido não sobrescreve válido; atualização de mapa restaura posição segura. |
| 84 | P0 / G / V | Medir renderização real: CPU/GPU, draw calls, memória, carregamento e custo de efeitos/sombras. | Há PC/navegador de referência registrados e captura de métricas antes/depois; alvo provisório 60 fps, piso 30 fps, sem declarar desempenho não medido. |
| 85 | P0 / M / V | Corrigir ciclo de vida de materiais, geometrias, texturas, áudios e listeners; otimizar instâncias após perfil. | Repetir troca de fase/reinício não mostra crescimento persistente após limpeza; nenhuma otimização é aceita só por reduzir linhas de código. |
| 86 | P0 / G / C | Acrescentar testes de browser/GPU e percursos sem teleporte, com portas fechadas e cada etapa de missão. | Fluxo completo funciona com controle normal; testes conferem visibilidade/câmera/colisão e não usam somente conectividade com tudo desbloqueado. |
| 87 | P1 / M / C | Criar validação e ferramentas de conteúdo: IDs estáveis, preview de spawn/colisor/alcance e edição de parâmetros. | Referências inválidas e objetivos inalcançáveis falham antes do build; um encontro pode ser ajustado sem reescrever lógica de interface. |
| 88 | P0 / M / C | Unificar plano/documentação, preparar build limpo e ciclo de feedback com versão e passos para reproduzir. | Plano vigente distingue entregue/futuro; build de jogo e galeria funciona em hospedagem estática; relatório de problema inclui versão, etapa e contexto sem coletar dados pessoais desnecessários. |

## Sequência de execução

Não implementar os 88 itens simultaneamente. Cada ciclo precisa produzir algo jogável e revisável. As referências são IDs do backlog; um item grande pode atravessar mais de um ciclo, mas só fica concluído quando seu critério passa.

### Ciclo A — medir e corrigir a base

Priorizar 02, 03, 05, 09, 10, 12, 26, 73, 82, 84 e 86. Usar um percurso e uma arena de teste, com apresentação provisória suficiente para avaliar controle. Registrar comportamento atual antes de alterar. Refatorar somente as partes de 81 necessárias para não misturar correções.

Saída: câmera utilizável, colisão previsível e um combate legível num navegador real. Nenhum mapa obrigatório pode depender de teleporte de teste.

### Ciclo B — aprovar identidade e primeiro trecho

Priorizar 17, 20, 21, 24, 33, 34, 36, 38, 40, 41 e 42. Produzir uma amostra de personagem e cenário; usá-la no começo do palácio. Trabalhar animação e combate juntos, aproveitando 07, 11, 14 e 28. Implantar 65, 69 e 71 para o som desse trecho.

Saída: um trecho curto com aparência, controle e áudio representativos. A meta de 10–15 minutos é de design, ainda precisa ser medida. Não produzir dezenas de modelos antes de revisar a amostra.

### Ciclo C — primeira fase completa

Priorizar 01, 13, 15, 16, 22, 23, 27, 29, 45, 46, 47, 49, 52, 74, 76, 78, 79, 80 e 83. Concluir combate e investigação do palácio com escolhas e checkpoint coerentes. Incluir arte e áudio ainda pendentes do ciclo B.

Saída: fase completa com ambas as rotas e ambos os personagens, incluindo derrota/retomada, sem problemas críticos observados.

### Ciclo D — diferenciar a campanha existente

Priorizar 18, 19, 25, 30, 31, 32, 35, 37, 43, 44, 48, 50, 51, 53, 54, 55, 66, 67, 68, 70, 72, 75 e 77. Aplicar o kit aprovado ao estúdio/jardim e produzir desafios exclusivos. Não duplicar missões da primeira fase como atalho de produção.

Saída: três capítulos com verbos, ritmo, ambientação e clímax próprios. As duas rotas têm conteúdo interessante, e todas as decisões principais chegam a um final consistente.

### Ciclo E — aprofundar RPG e preparar distribuição

Priorizar 04, 06, 08, 39, 57, 58, 59, 60, 61, 63, 81, 85, 87 e 88, concluindo também os itens de qualidade que permanecerem abertos. Fazer avaliação contínua de 16, 79, 84 e 86 após mudanças relevantes.

Saída: escolhas de build compreensíveis, conteúdo e assets fáceis de manter, versão distribuível medida e testada.

### Ciclo F — expandir depois da validação

Itens 56, 62 e 64. Escolher expansão narrativa, aliado e modo de desafio conforme o que os testes indicarem que vale ampliar. Multiplayer, cidade aberta e veículos continuam propostas separadas: não entram implicitamente neste backlog.

Saída: módulo adicional com mecânica própria, que reaproveita qualidade comprovada sem repetir estrutura e textos.

## Dependências que evitam retrabalho

- Personagens e clips (34, 41, 42) dependem da amostra de arte (33); novas roupas e elenco entram depois da escala/rig aprovados.
- Novos mapas (18, 19) dependem de câmera/colisão (02, 03, 05) e do kit arquitetônico (37).
- Chefes (29–31) dependem de acerto e reação (09–12), arenas (21), navegação (26) e sinais (28).
- Missões e finais (50–56) dependem da cadeia de provas (49); escolhas de estado devem atualizar o schema de save (83).
- Equipamento e especializações (57–61) dependem do balanceamento básico (16) e de habilidades distintas (14).
- Música/ambientação (67–70) dependem de mixagem e controles de volume (71), não só da existência dos arquivos.
- Otimizações (84, 85) precisam medir a cena representativa; desempenho de um mapa vazio não aprova a campanha.
- O ciclo E não pode ser usado para adiar falhas P0 que impedem testar o ciclo C.

## Validação com jogadores

Primeira rodada proposta: cinco pessoas que não conhecem o código, jogando o mesmo trecho; repetir depois das correções. Essa amostra orienta decisões, não representa prova estatística de preferência.

Observar sem explicar: tempo até entender objetivo, dúvidas de controle, colisões, perda de visão, reconhecimento de acerto/dano, uso de defesa/esquiva, erros de navegação, compreensão da prova e motivos da escolha de rota. Separar observação de opinião e registrar trechos concretos.

Metas iniciais propostas para o trecho:

- Pelo menos quatro das cinco pessoas chegam ao primeiro objetivo sem instrução externa.
- Pelo menos quatro distinguem acertar, errar, bloquear e tomar dano depois do tutorial.
- Ninguém encontra bloqueio de missão, prisão de câmera ou perda do save no percurso observado.
- Cada participante consegue explicar o que a prova revelou e por que vai à próxima área.
- Métricas de tempo de luta e travessia alimentam o balanceamento; não definir dificuldade somente por impressão do desenvolvedor.

Verificação técnica paralela: browsers e equipamento de referência definidos, dois protagonistas, duas rotas, dificuldade assistida/padrão, teclado/mouse, redução de efeitos, saves antigos, importação inválida, pausa, perda de foco e reinício durante ação. Controlador é uma expansão possível, não suporte já prometido.

## Definição de pronto e registro

Uma tarefa só é concluída quando: entrega existe, critério da linha foi verificado pelo método adequado, documentação relevante foi atualizada e regressões essenciais passaram. Teste de DOM não substitui inspeção de imagem, áudio ou sensação de controle. Uma correção visual deve trazer comparação na câmera de jogo; ajuste de desempenho precisa de medidas; conteúdo exige percurso completo.

Para cada implementação registrar: ID, estado (pendente/em andamento/em validação/concluído), dependências, arquivos/artifacts, evidência de teste e pendências. Marcar parcialmente feito como em andamento, sem contabilizar como concluído.

Prazos e duração total de campanha serão estimados depois do ciclo C, usando o custo real de produzir e revisar uma fase. Quantidade de capítulos não será usada como medida de qualidade.

## Execução ampliada: v0.6

A execução dos 88 IDs, autorizada integralmente pelo usuário, está em [IMPLEMENTACAO.md](IMPLEMENTACAO.md). O registro distingue implementação funcional, validação e trabalho ainda em andamento. Nenhum item visual, sonoro ou de desempenho foi aprovado sem o método adequado. A autorização antecipou os módulos extras; a validação humana continua pendente.
