> Histórico de concepção. Direção e execução vigentes: README.md, HISTORIA.md e IMPLEMENTACAO.md. As decisões de origem dos assets e arte foram delegadas e executadas com recursos locais originais.

# Brasília: O Último Debate

Plano de produto e implementação, versão inicial de 02/10/2026.

Plano vigente de revisão: [PLANO_MELHORIAS.md](PLANO_MELHORIAS.md), com 88 itens baseados na v0.4. As propostas abaixo preservam o histórico e não substituem o backlog atual.

## Estado da implementação, v0.3

Depois deste plano, o autor autorizou implementação, delegou arte e origem dos recursos e pediu ampliar a campanha. A versão atual já contém três capítulos conectados, combate em tempo real, dois protagonistas, seis objetivos opcionais, três chefes, melhorias cumulativas, checkpoints e epílogos com consequências.

Modelos e efeitos foram criados no código; áudio sintetizado localmente. A base efetiva usa JavaScript em módulos e Three.js 0.170.0 distribuído no projeto. Não usa Babylon.js, TypeScript ou Vite: a indisponibilidade de rede levou à distribuição local e a scripts nativos de desenvolvimento/build. Essa implementação é descrita no `README.md`.

Os cenários compartilham arquitetura modular, com objetos e ambientações específicos. Backend, multiplayer, cidade aberta, acompanhantes controláveis, inventário com equipamentos livres, música e dublagem continuam fora desta versão. Os testes de regras e integração sem GPU passaram; aparência, câmera e desempenho em WebGL ainda exigem validação num navegador real porque o sandbox bloqueou seu início.

As seções abaixo preservam o plano original como referência de expansão; metas futuras não são uma lista de funcionalidades já entregues.

Este documento propõe a evolução do protótipo. Nenhum dos recursos futuros descritos aqui está implementado. Direção confirmada pelo autor: terceira pessoa, combate em tempo real e PC no navegador.

## 1. O produto

Um RPG 3D de comédia e investigação numa Brasília fantástica, onde o desaparecimento do café desencadeia uma crise nos corredores do poder. O jogador explora espaços reconhecíveis, entrevista personagens, reúne provas e enfrenta manifestações da burocracia e da polarização.

A promessa: resolver uma conspiração absurda com um personagem e uma estratégia próprios, vendo as consequências das suas escolhas no cenário e no desfecho.

Público inicial: pessoas que gostam de RPGs curtos, humor brasileiro e decisões táticas. Partidas individuais, em português, com campanha finita e possibilidade de rejogar com outro protagonista.

Três pilares:

- **Brasília como lugar jogável:** arquitetura, corredores, praças e bastidores têm interações e pistas, além de servirem de cenário.
- **Debates como batalhas:** ataques, argumentos, cura e negociação usam regras compreensíveis e estratégias distintas.
- **Escolhas com consequência:** polarização e provas coletadas alteram encontros, diálogos e finais.

## 2. O que o protótipo já oferece

O projeto contém `index.html` e `README.txt`. Toda a apresentação e a lógica estão no HTML.

| Existe hoje | Evolução proposta |
| --- | --- |
| Luli e Folfonaro com quatro habilidades cada | Dois protagonistas com estilos diferentes, progressão e falas específicas |
| Três confrontos sequenciais | Três capítulos com exploração, missões e encontros próprios |
| Roubo do café como premissa | Investigação principal com pistas e conclusão |
| Polarização de 0 a 100 | Sistema visível que afeta combate, mundo e epílogo |
| Cura, crítico, enfraquecimento e ultimate | Combate em tempo real com custos, recargas, ataques anunciados e efeitos bem definidos |
| Três textos de final | Desfechos baseados em polarização e decisões da investigação |
| Tentativa novamente após derrota | Checkpoints, salvamento e repetição sem perder progresso anterior |

Não há exploração, inventário, níveis, missões opcionais, modelos 3D, áudio ou salvamento.

Pontos a resolver na migração:

- `atk` e `def` não entram no cálculo de dano atual; os atributos apresentados também não correspondem integralmente aos dados usados. Na nova versão, cada atributo precisa de efeito real ou deve sair da ficha.
- O bônus de `enemyWeaken` multiplica o dano do jogador por 0,75, apesar de ser descrito como vantagem, e não é consumido no próximo golpe. Substituir por efeitos explícitos com duração.
- `cleanse` zera o efeito que reduz dano recebido pelo jogador. Distinguir efeitos positivos de negativos antes de implementar limpeza.
- As habilidades comuns não têm custo; cura repetida tende a reduzir a decisão tática. Introduzir um recurso simples e verificar o balanceamento.
- Callbacks com `setTimeout` podem continuar depois de reiniciar a partida. A futura máquina de estados deve invalidar ações de uma sessão encerrada.

O código antigo serve como referência de conteúdo. A lógica precisa ser reescrita em módulos testáveis antes de receber a camada 3D.

## 3. Forma de jogar

Exploração em terceira pessoa, com câmera acompanhando o protagonista e rotação limitada em interiores. Áreas pequenas conectadas por transições, para concentrar conteúdo e controlar carregamento.

Controles propostos: WASD para andar, mouse para câmera, botão esquerdo para ataque básico, botão direito para defesa, Espaço para esquiva, E para interagir, 1 a 4 para habilidades e Esc para pausar. Oferecer alternativa de câmera pelo teclado e liberar o mouse ao abrir menus. Capturar o mouse após ação explícita; perder foco ou sair da captura pausa a partida.

O ciclo principal:

1. Chegar a uma área com uma pergunta da investigação.
2. Explorar, conversar e encontrar pistas ou tarefas opcionais.
3. Escolher um caminho: confrontar, negociar ou preparar uma vantagem.
4. Resolver um encontro e receber evidência, experiência e um item.
5. Ajustar habilidades e equipamento num ponto de descanso.
6. Abrir a próxima área e observar a consequência da decisão anterior.

Exemplo: um assessor só libera o corredor mediante um protocolo. O jogador pode recuperar o carimbo perdido, convencê-lo com uma pista ou enfrentar a Comissão do Carimbo. Cada solução desbloqueia a passagem; a recompensa e a polarização mudam. Assim, o conteúdo opcional interfere na missão principal.

## 4. Escopo da versão 1.0

Os números abaixo são metas propostas de produção, não conteúdo existente nem estimativas medidas de duração.

| Elemento | Meta inicial |
| --- | --- |
| Campanha | 3 capítulos e epílogo |
| Mundo | 1 base pequena e 3 áreas principais |
| Protagonistas | 2, reaproveitando os do protótipo |
| Acompanhantes | 2 NPCs, com 1 apoio equipado por vez |
| Missões | 3 principais e 6 opcionais |
| Personagens de conversa | Cerca de 10 NPCs recorrentes |
| Adversários | 6 tipos comuns e os 3 chefes atuais |
| Progressão | Níveis 1 a 6; 2 especializações por protagonista |
| Habilidades | 6 por protagonista; 4 equipadas por batalha |
| Itens | Cerca de 12 entre consumíveis e equipamentos |
| Finais | 3 famílias de desfecho, com variações por escolha |
| Duração desejada | 2 a 3 horas na primeira campanha, a validar em testes |

Fora da primeira versão: mundo aberto na escala da cidade, multiplayer, criação livre de personagem, veículos dirigíveis, crafting, geração procedural, dublagem completa e conteúdo infinito. Esses recursos aumentam muito a produção sem serem necessários para concluir esta aventura.

## 5. Campanha e conteúdo

### Base: Gabinete de Crise do Café

Um espaço de retorno com um estagiário, uma copeira e um mural de evidências. Serve para recapitular a missão, descansar e trocar habilidades. Sua aparência muda conforme a investigação avança. Sem construir uma economia de gerenciamento de base.

### Capítulo 1: O Corredor das Emendas

Objetivo: descobrir para onde foram enviados os pacotes de café.

- Exploração: praça de chegada e ala administrativa com atalhos desbloqueáveis.
- NPCs: copeira, assessor e guardião do protocolo.
- Missões opcionais: recuperar um carimbo e encontrar uma pauta desaparecida.
- Inimigos: Comissão do Carimbo e Pilha de Processos.
- Chefe: O Centrão, com braços que anunciam intenções diferentes.
- Mecânica: desativar um braço ou usar a documentação encontrada para impedir uma troca de favores.
- Conclusão: obter a nota fiscal que aponta para a sala de mídia.

### Capítulo 2: A Câmara dos Cortes

Objetivo: reconstruir o vídeo que revela o trajeto do café.

- Exploração: estúdio, arquivo e corredores com telas.
- Missões opcionais: recuperar o contexto de uma fala e desligar uma transmissão automática.
- Inimigos: Bot de Engajamento e Manchete Ambulante.
- Chefe: Influencer Político, cuja audiência fortalece ataques.
- Mecânica: usar trechos comprovados para reduzir audiência ou aceitar a viralização para ganhar força com mais polarização.
- Conclusão: descobrir o grupo que recebeu a localização do café.

### Capítulo 3: O Grupo da Família

Objetivo: localizar o depósito e interromper o ciclo de encaminhamentos.

- Exploração: centro comunitário surreal, onde mensagens viraram obstáculos físicos.
- Missões opcionais: reunir os participantes de uma conversa e recuperar a mensagem original.
- Inimigos: Corrente Infinita e Áudio Interminável.
- Chefe: Tio do Zap, em duas fases com padrões anunciados.
- Mecânica: provas reduzem o alcance dos encaminhamentos; ataques fortes sem preparação aumentam o caos.
- Conclusão: recuperar o café e decidir como comunicar o ocorrido.

### Epílogo

A polarização define o clima do encerramento. Decisões importantes definem quem participa, quais conflitos foram resolvidos e como as provas são usadas. Evitar reduzir toda a história a um único número.

O tom permanece absurdo e fictício, coerente com a paródia já presente. Diálogos dos protagonistas são escritos para o universo do jogo e apresentados como falas ficcionais. O elenco novo será formado principalmente por personagens inventados, para dar liberdade à história.

## 6. Sistemas de RPG

### Combate

Combate em tempo real, integrado à exploração em arenas delimitadas. Um protagonista contra um ou dois adversários comuns inicialmente; chefes com componentes ou fases. Um acompanhante pode fornecer uma ação de apoio com recarga, sem exigir controle de um grupo inteiro.

- Ataque básico com sequência curta de dois golpes e recuperação legível. Sem árvores extensas de combos na primeira versão.
- Defesa reduz dano frontal e consome Fôlego. Esquiva gasta Fôlego, tem recuperação e breve janela de proteção, com valores a testar.
- Fôlego recupera fora de ações custosas; habilidades têm recargas próprias. Cura usa carga limitada por encontro, evitando recuperação infinita por espera.
- Quatro habilidades equipadas misturam ataque, controle e suporte. Luli começa com ondas sonoras e apoio; Folfonaro com golpes próximos e avanço frontal. Ambos precisam lidar com alvos próximos e distantes.
- Ultimate continua limitado a uma utilização por encontro, com preparação visível.
- Inimigos anunciam ataques por pose, som e marcação espacial quando necessária. O jogador responde saindo da área, defendendo ou interrompendo.
- Consumíveis têm quantidade limitada e animação curta de uso; golpes podem interrompê-los. Abrir o menu não permite aplicar itens instantaneamente durante a luta.
- Efeitos iniciais: enfraquecido, protegido e confuso, com duração em segundos. Confusão altera recursos ou habilidades, sem inverter controles ou mover a câmera à força.
- Evitar críticos aleatórios no primeiro teste: validar alcance, impacto, esquiva e leitura antes de adicionar variação de dano.
- Negociação é uma alternativa anterior ao início de alguns encontros, habilitada por provas ou escolhas anteriores.

Inimigos usam estados de patrulha, detecção, aproximação, preparação, ataque, recuperação e derrota. Definir alcance de perseguição e retorno. Coordenar agressores para evitar golpes inevitáveis simultâneos.

Movimento é relativo à câmera. Oferecer assistência leve de direção no ataque e seleção opcional de alvo, sem obrigar travamento de câmera. Manter protagonista e sinais dos chefes visíveis.

Separar regras e apresentação, sincronizando impactos com janelas da animação. A simulação controla tempo, alcance, hitboxes, recargas e efeitos; a apresentação comunica preparação, acerto e recuperação. Cada golpe só pode atingir o mesmo alvo uma vez por janela. Usar atualização com passo controlado, limitar atrasos e pausar ao perder foco, evitando saltos de simulação ao retornar à aba.

A primeira arena valida um golpe, uma esquiva e um inimigo com dois padrões antes de adicionar as quatro habilidades e o chefe. A qualidade dos controles é condição para expandir conteúdo.

### Polarização

Manter a escala de 0 a 100 e usar faixas inicialmente próximas às atuais: 0 a 39, 40 a 74 e 75 a 100. Os valores exatos serão balanceados.

- Mostrar antecipadamente a alteração causada por uma habilidade ou escolha conhecida.
- Faixa baixa: oportunidades de negociação e apoio mais estável.
- Faixa média: encontros normais e opções mistas.
- Faixa alta: ataques de maior risco e retorno, inimigos mais agressivos e mudanças de ambientação.
- Provas e missões permitem reduzir polarização sem depender apenas de uma habilidade de cura.
- A polarização do mundo influencia encontros futuros; alterações de combate são consolidadas ao vencer. Derrota restaura o checkpoint, evitando acumulação acidental por repetição.

Polarização alta deve abrir uma estratégia viável e um desfecho próprio, em vez de funcionar apenas como punição. Protagonista e posicionamento político não determinam automaticamente o final.

### Progressão e equipamento

Experiência vem de objetivos e encontros únicos; inimigos derrotados não reaparecem para exigir repetição. Cada nível concede uma escolha pequena: melhorar uma habilidade ou desbloquear outra.

Bardo Sindical: especializações em suporte diplomático ou controle de ritmo. Paladino do Zap: proteção e contra-ataque ou dano de alto risco. Ambos precisam conseguir concluir a campanha em qualquer faixa de polarização.

Inventário com consumíveis e dois espaços de equipamento: acessório e instrumento de debate. Exemplos propostos: garrafa térmica, crachá provisório, microfone e pasta de documentos. Preferir efeitos que mudam decisões a dezenas de itens com diferenças mínimas.

### Missões e salvamento

Missões seguem estados explícitos: disponível, ativa, objetivo cumprido e concluída. Cada objetivo referencia entidades por identificadores estáveis. O diário distingue objetivo atual de conteúdo opcional.

Salvar após missões, transições e antes de chefes. Três slots e exportação/importação de arquivo na versão completa. Save inclui versão do formato, personagem, progressão, inventário, missões, escolhas, polarização e checkpoint. Não salvar uma animação pela metade.

Validar o arquivo antes de carregar. Se estiver inválido ou for incompatível, explicar o problema e manter os outros saves. Configurações ficam separadas da campanha.

## 7. Direção visual e sonora proposta

Direção para discutir antes de produzir arte ou interface: caricatura 3D estilizada, geometria simples, silhuetas fortes e Brasília reconhecível pelo concreto claro, curvas arquitetônicas, espaços amplos e céu de fim de tarde.

Protagonistas com proporções exageradas; monstros derivados de objetos burocráticos e digitais. Cenários compactos com um marco visual por área. Humor aparece nas interações, nos objetos e nas animações, além dos textos.

Elementos de interface lembram documentos, carimbos e quadros de pauta quando isso comunica uma função. A área de combate prioriza o cenário, a intenção inimiga e as ações disponíveis. Diálogo mostra falante, texto, opções e consequências conhecidas. Não cobrir a cena com painéis sem necessidade.

Produção visual:

1. Geometria provisória para testar escala, câmera e circulação.
2. Kit modular de paredes, portas, mobiliário e elementos externos.
3. Um personagem com rig reutilizável e animações de repouso, caminhada, reação, ação, vitória e derrota.
4. Chefes com silhuetas e animações próprias.
5. Materiais, iluminação, efeitos e acabamento após validar a missão.

Áudio: ambientação, passos, navegação, pistas sonoras de intenção, impactos e temas curtos por capítulo. Iniciar áudio mediante ação do jogador e oferecer volumes separados. Música e assets devem ter origem e licença registradas no projeto.

## 8. Tecnologia proposta

Para o destino confirmado de PC no navegador: **TypeScript + Babylon.js + Vite**, com interfaces em HTML/CSS sobre o canvas. É uma recomendação de arquitetura, não uma dependência já instalada.

Babylon.js oferece sistemas para cenas, câmeras, animações, áudio e importação de modelos, o que reduz a quantidade de infraestrutura 3D que precisaríamos escrever. Referências oficiais: [recursos do motor](https://www.babylonjs.com/specifications/) e [visão dos sistemas de cena](https://www.babylonjs.com/learn/).

Modelos em GLB, produzidos ou ajustados no Blender. Colisões simples e zonas de interação no início; física complexa só se uma mecânica exigir. Preferir renderização compatível e carregamento por área. Definir versões de dependências ao iniciar a implementação.

O navegador é a plataforma da primeira versão. Um aplicativo de PC pode ser reavaliado após validar a campanha; não manter duas implementações de motor em paralelo.

Estrutura proposta:

```text
src/
  app/          inicialização, estados e carregamento
  domain/       regras de combate, progressão, missões e polarização
  content/      definições de personagens, itens, encontros e diálogos
  world/        áreas, câmera, movimento, colisões e interações
  presentation/ eventos visuais, animações e áudio
  ui/           menus, HUD, diário, inventário e diálogos
  persistence/  saves, validação e migrações
public/assets/  modelos, texturas e áudio
tests/          regras e percursos completos
```

Estados principais: menu, carregamento, exploração, diálogo, combate, recompensa, derrota, pausa e epílogo. Exploração e combate compartilham o mundo; a mudança ativa regras do encontro e limites de arena. A pausa interrompe simulação, recargas, efeitos e entradas; o retorno mantém o contexto correto.

Conteúdo usa dados separados das regras. Uma habilidade define custo, alvo e efeitos; uma missão define requisitos, objetivos e recompensas; um diálogo define falas, condições e escolhas. Usar condições declarativas, evitando executar código arbitrário vindo de arquivos de conteúdo.

Sem conta ou backend na primeira versão. Hospedagem estática e saves locais atendem a campanha individual. Explicar no menu de saves que limpar dados do navegador pode removê-los e oferecer exportação.

## 9. Primeira entrega jogável

Uma missão de 15 a 25 minutos como meta de design: **O Café Sumiu**. Ela deve demonstrar todos os pilares, com pouco conteúdo.

Escopo:

- Um protagonista inicialmente, para validar o fluxo.
- Praça pequena conectada a um corredor administrativo.
- Três NPCs, uma pista coletável e uma missão opcional do carimbo.
- Um encontro comum e uma versão simplificada do Centrão.
- Quatro habilidades, um consumível, uma recompensa e uma escolha de progressão.
- Uma negociação alternativa com requisito verificável.
- Uma mudança visível de polarização e uma conclusão local.
- Menu, pausa, configurações mínimas e um slot de save.

Critérios de aceite:

- Começar uma partida e terminar a missão sem comandos de desenvolvimento.
- Saber onde ir pelo cenário e pelo diário.
- Colisões impedem atravessar paredes e a câmera não bloqueia a visão nos locais obrigatórios.
- A missão opcional altera concretamente um encontro ou solução.
- Custos, recargas, sinais de ataque e duração dos estados ficam legíveis no combate.
- Ataques acertam dentro do alcance previsto, sem hits duplicados; defesa e esquiva respondem nas janelas permitidas.
- Os dois padrões do inimigo podem ser evitados lendo seus sinais, sem conhecer o código.
- Pausa, perda de foco e saída da captura interrompem a simulação sem dano inesperado ao retornar.
- Perder permite repetir pelo checkpoint, com estado consistente.
- Fechar e reabrir o navegador restaura o progresso no ponto previsto.
- Reiniciar não permite que ataques ou recompensas da partida anterior afetem a nova.
- Ambos os caminhos de resolução chegam à conclusão correta.

O segundo protagonista entra depois que esse percurso estiver estável. Arte definitiva começa por uma pequena amostra, antes de produzir todo o elenco.

## 10. Sequência de implementação

| Etapa | Entrega | Condição para avançar |
| --- | --- | --- |
| 0. Decisões | Registrar plataforma e combate confirmados; fechar arte e escopo | Direção suficiente para a área provisória |
| 1. Base | Projeto modular; simulação; máquina de estados; checkpoint | Tempo controlado, pausa e reinício seguros |
| 2. Exploração e ação | Área provisória; câmera; colisão; diálogo; arena com um inimigo | Percurso sem travas; ataque, defesa e esquiva responsivos |
| 3. Missão completa | Investigação, combate, negociação, recompensa e save | Todos os critérios da primeira entrega atendidos |
| 4. Identidade e elenco | Amostra de arte aprovada; áudio inicial; segundo protagonista | Legibilidade e dois estilos de jogo validados |
| 5. Campanha | Restante das áreas, missões, itens, chefes e finais | Campanha inteira concluível com os dois protagonistas |
| 6. Preparação de lançamento | Balanceamento, acessibilidade, desempenho, saves e build hospedável | Checklist de lançamento atendido |

Não estimar prazo fechado antes da etapa 3. Essa entrega revela o custo real de criar uma área, um personagem e uma missão. A partir dela, estimar o restante com base na produção observada e na disponibilidade de trabalho.

## 11. Validação e definição de pronto

Testes de regras cobrem consumo e regeneração de Fôlego, recargas, limites de vida, efeitos temporários, acerto único por golpe, proteção da esquiva, ultimate, derrota, polarização e progressão. Usar relógio de simulação controlável para reproduzir resultados.

Testes de percurso cobrem nova campanha, diálogo com condição, negociação, vitória, derrota, save/load e reinício durante uma animação. Conteúdo deve ser validado contra referências inexistentes, missões sem conclusão e diálogos sem saída.

Verificação manual: explorar áreas inteiras, ler textos no tamanho mínimo suportado, operar menus pelo teclado, pausar em estados diferentes e conferir câmera e colisão. Realizar sessões com jogadores que não conhecem a missão; observar dúvidas e escolhas antes de explicar as regras.

Metas provisórias de desempenho: 60 fps como alvo e 30 fps como mínimo aceitável no PC de referência, a definir e registrar na etapa 2. Medir carregamento, memória e tempo por quadro. Se o alvo falhar, reduzir materiais, sombras, resolução e complexidade antes de expandir mapas. Estes valores são metas, não desempenho comprovado.

Checklist de lançamento:

- Campanha concluível com ambos os personagens e todos os desfechos principais verificados.
- Nenhuma missão obrigatória perde acesso por uma escolha opcional.
- Saves válidos, inválidos e incompatíveis tratados sem travamento.
- Menus por teclado; texto ajustável; informações sem depender só de cor; redução de efeitos e movimento de câmera; dificuldade ajustável para dano e tolerância de reação.
- Áudio configurável, pausa funcional e configurações persistentes.
- Carregamento com progresso e erro recuperável; mensagem clara se o dispositivo não suportar a renderização.
- Créditos e registro de licenças dos assets completos.
- Build de produção testado no navegador e no equipamento de referência.
- Instruções para jogar, salvar e reportar problemas.

## 12. Riscos e decisões pendentes

| Risco | Como reduzir |
| --- | --- |
| Produzir 3D consome mais trabalho que ampliar o HTML | Uma missão completa e um kit modular antes da campanha |
| Mais conteúdo sem decisões novas | Cada missão muda uma rota, encontro, recompensa ou epílogo |
| Cura ilimitada ou estratégia dominante | Cargas limitadas, custos, recargas e testes com os dois personagens |
| Combate parece sem impacto ou injusto | Arena pequena, sinais claros, janelas de acerto e recuperação; validar controles antes de ampliar conteúdo |
| Câmera ruim em corredores | Área provisória e teste dos interiores antes da arte |
| Texto demais interrompe a exploração | Diálogos curtos; detalhes opcionais no diário |
| Desempenho varia entre PCs | Equipamento de referência, presets e carregamento por área |
| Save quebra ao atualizar conteúdo | Identificadores estáveis, versão de formato e validação |

Decisões confirmadas: PC no navegador, terceira pessoa e combate em tempo real. Decisões restantes: caricatura ou outra direção visual; e disponibilidade para produzir modelos e áudio próprios ou usar assets licenciados. A base e a arena podem começar com geometria explicitamente provisória enquanto a direção artística é definida.

Próximo trabalho proposto: executar as etapas 0 e 1, seguido da área provisória e da missão **O Café Sumiu**. O objetivo desse primeiro ciclo é comprovar que explorar, investigar e debater é divertido antes de ampliar a campanha.
