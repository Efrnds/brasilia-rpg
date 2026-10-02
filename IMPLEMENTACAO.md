# Execução integral do backlog: v0.6

Escopo autorizado: implementar os 88 itens, sem encerrar em ciclos parciais. A versão incorpora sistemas, campanha, pack, áudio, ferramentas e módulos extras. Este registro cobre cada ID; **cobertura de implementação não equivale a aprovação de todos os critérios**.

**C = funcionalmente concluído e verificado no método indicado; V = implementação em validação de imagem, áudio ou sessão humana; A = em andamento porque faltam medidas/sessões e o trabalho que elas podem exigir.** Não há declaração de 88/88 aprovados. Os itens 16, 24, 84 e 86 continuam em andamento. Os V podem demandar ajustes depois de serem vistos/ouvidos; não são contados como concluídos.

O sandbox bloqueou o servidor (`listen EPERM`) e o Chromium (crashpad em diretório somente leitura / encerramento na inicialização). Registro da tentativa em `test-results/browser/failure.txt`. Nenhuma captura foi inventada; nenhum alvo de desempenho foi declarado atingido.

| ID | Estado | Entrega concreta | Arquivos | Evidência / limite |
|---|---|---|---|---|
| 01 | V | Aceleração, parada e giro suaves; ação preserva orientação. | src/tuning.js, src/main.js | Percurso por teclas; falta avaliação de sensação. |
| 02 | V | Câmera com varredura de volume e reteste após suavização. | src/camera.js, src/collision.js | Geometria/testes passam; captura real pendente. |
| 03 | V | Alvo acompanha piso/rampas; câmera mantém limite vertical. | src/camera.js | Percursos elevados passam; enquadramento visual pendente. |
| 04 | C | Fixação, troca, liberação por morte/distância e marcador. | src/main.js, src/world.js | Comandos e alvo inválido exercitados; revisar leitura visual. |
| 05 | V | Raio circular, deslizamento, subpassos e altura. | src/collision.js, src/world.js | Campanha/extras percorridos por teclas; qualidade visual pendente. |
| 06 | C | Corrida interrompida por ações, consumo 48/s sem regeneração. | src/tuning.js, src/main.js | Regra única e descrição em README. |
| 07 | C | Buffers de ataque/esquiva 0,16 s e cancelamento declarado. | src/main.js, src/combat.js | Regressão de toque perto da recuperação e execução única. |
| 08 | C | Sensibilidades, duas inversões, FOV e captura/arrastar. | src/settings.js, src/input.js | Preferências persistidas; alternativa de setas exercitada. |
| 09 | V | Arco compartilhado, impacto em 0,20 s, parede/altura. | src/combat.js, src/encounter-controller.js | Acerto real na simulação; passagem da arma exige imagem. |
| 10 | V | Sinais distintos para erro, acerto, bloqueio e dano. | src/world.js, src/audio.js | Partículas, números e feedback verificados; percepção humana pendente. |
| 11 | V | Reação breve, interrupção e resistência temporária 2,5 s. | src/encounter-controller.js | IA usa limite de interrupção; sessões de leitura pendentes. |
| 12 | V | Esquiva com proteção ligada ao deslocamento/animação. | src/combat.js, src/domain.js | Custo, recarga e proteção testados; sensação pendente. |
| 13 | V | Postura, custo, quebra 1,4 s e contra-ataque. | src/domain.js, assets/pack/animation.js | Regras e equipamento testados; leitura corporal pendente. |
| 14 | V | 12 habilidades totais: cone, golpe, avanço, campo, onda, cura, proteção e interrupção. | src/rpg.js, src/encounter-controller.js | Custos e recuperação únicos; revisão gráfica dos efeitos pendente. |
| 15 | C | Cura limitada e restauração em checkpoints de encontro. | src/domain.js, src/interface-controller.js | Duas rotas/personagens terminam; carga não se duplica em treino. |
| 16 | A | Tabela e registros de simulação para balanceamento. | BALANCEAMENTO.md, test-results/balance-*.json | Faltam sessões humanas e ajuste orientado por esses resultados. |
| 17 | V | Praça, arquivo lateral, corredor, plenária e saída. | src/levels.js, src/level-geometry.js, HISTORIA.md | Percurso completo passa; orientação de pessoas pendente. |
| 18 | V | Bruto cronológico, reparo de áudio, console, câmeras e passarela. | src/investigation.js, src/environment.js | Puzzles, efeitos no encontro e percurso testados. |
| 19 | V | Origem/relé, pontes, atalho e depósito elevados. | src/investigation.js, src/levels.js | Interações e percurso testados; retorno percebido pendente. |
| 20 | V | Placas menores, copa iluminada, janelas/portas e opção sem minimapa. | src/level-geometry.js, src/settings.js | Não aprovado: testar primeira orientação sem explicação. |
| 21 | V | Cobertura e respostas diferentes a linha/anel/cone. | src/levels.js, src/encounters.js | Posições seguras nas regras; resposta perto de borda exige sessão. |
| 22 | C | Console, comissões, câmeras, relé, ponte e armários. | src/environment.js, src/investigation-controller.js | Todas as interações testadas e efeitos persistidos. |
| 23 | C | Segredos com equipamento e ponte mantida no save. | src/environment.js, src/domain.js | Descoberta, recompensa única e persistência testadas. |
| 24 | A | Percursos e registros automatizados; mapa anotado por função. | src/levels.js, HISTORIA.md | Falta medir trechos sem decisão com pessoas e revisar densidade. |
| 25 | V | Perseguidor, guarda, distante e suporte com cura limitada. | src/encounters.js, src/encounter-controller.js | Comportamentos executados; reconhecimento de silhueta pendente. |
| 26 | V | Busca de caminho, obstáculo/desnível, retorno ao spawn. | src/world.js, src/encounter-controller.js | Conectividade/percursos passam; custo e acumulação reais pendentes. |
| 27 | V | Uma preparação de ataque por oportunidade. | src/encounter-controller.js | Encontros simulados terminam; replay humano pendente. |
| 28 | V | Preparação corporal e geometria própria de linha/anel/cone. | src/world.js, src/encounters.js | Forma/alcance testados; legibilidade sem som pendente. |
| 29 | V | Comissão por documentação e braços por combos. | src/environment.js, src/encounter-controller.js | Estado altera recuperação/dano; avaliação do encontro pendente. |
| 30 | C | Câmeras ampliam dano; console/edição desligam audiência. | src/encounters.js, src/environment.js | Modificadores e todas as interações testados. |
| 31 | C | Meia vida invoca reforços uma vez; relé os bloqueia. | src/encounter-controller.js, src/encounters.js | Invocação limitada e regra do relé testadas. |
| 32 | C | Prova, acordo anterior e polarização alteram fala/regras. | src/investigation-controller.js, src/encounters.js | Escolhas persistem e modificam encontros. |
| 33 | V | Amostra de personagem, inimigo, móvel e arquitetura na galeria. | assets/pack/sample.js | Produzida; aprovação visual não ocorreu. |
| 34 | V | Protagonistas com rosto, roupa, mãos e acessórios próprios. | assets/pack/characters.js | Rig/export/ação passam; reconhecimento à distância pendente. |
| 35 | V | Monstros de papel/equipamento, juntas, materiais e humanoide. | src/world.js | Geometria executada; qualidade de construção não aprovada. |
| 36 | V | Bordas, peças de montagem, pivô e escala dos props. | assets/pack/props.js | Exports conservam dimensões; comparativo visual pendente. |
| 37 | V | Nove módulos, porta articulada, rampa e corrimão. | assets/pack/architecture.js, src/level-geometry.js | Kit exporta; avaliação gráfica de cômodo/câmera pendente. |
| 38 | V | Concreto, madeira, metal, tecido, papel, vidro, folhagem. | assets/pack/materials.js | Propriedades/exports presentes; comparação sob luz pendente. |
| 39 | C | Manifesto v3, metros, pivôs, footprint, JSON e GLB. | scripts/export-assets.js, assets/pack/manifest.json | Import independente e GLB/hierarquia/clips verificados. |
| 40 | V | Luz local, mobiliário por função, menos texto suspenso. | src/level-geometry.js, src/world.js | Não aprovado: faltam capturas em câmera de jogo. |
| 41 | V | Rig articulado reutilizável e 12 AnimationClips exportáveis. | assets/pack/characters.js, assets/pack/animation.js | Movimento de ossos/GLB testados; aprovação visual pendente. |
| 42 | V | Mixer, crossfade, precedência de ação e recuperação. | assets/pack/animation.js, src/main.js | Repetição/transição testadas; salto de pose exige imagem. |
| 43 | V | Cadência por velocidade e correção limitada de altura dos pés. | src/world.js | Ainda é correção simples; contato/deslizamento precisa inspeção. |
| 44 | V | Olhar/conversa/operação com mesa; portas/armário/válvula. | src/world.js, src/expansion.js | Props animam por interação; correspondência mão/objeto pendente. |
| 45 | V | Papel/metal/corpo, partículas/som e sangue compatível opcional. | src/world.js, src/audio.js | Simulação verifica feedback; som ouvido e imagem pendentes. |
| 46 | C | Pausa de impacto limitada, tremor/clarão/sangue independentes. | src/settings.js, src/world.js | Limites e controles separados; efeito pode ser desativado. |
| 47 | V | Queda, morte/vitória e atraso antes de ocultar/recompensar. | src/world.js, assets/pack/animation.js | Encerramento simulado passa; revisar pose final. |
| 48 | V | Enquadramento de entrada/queda, gesto e botões de pular. | src/cinematics.js, src/encounter-controller.js | Controle não prende/recompensa não duplica; encerramento pula queda sem duplicar recompensa; revisar direção. |
| 49 | C | Bíblia, cronologia e cadeia de provas. | HISTORIA.md, src/content.js | Provas têm origem e finais distinguem registros ausentes. |
| 50 | V | Arcos de protocolo, edição e rede, com puzzles próprios. | HISTORIA.md, src/investigation.js | Fluxos testados; avaliar ritmo narrativo jogando. |
| 51 | V | Respostas e especializações próprias dos protagonistas. | src/content.js, src/investigation-controller.js | Informação compartilhada; revisão editorial jogando pendente. |
| 52 | C | Negociação exige dedução, correção e contexto original. | src/investigation.js, src/investigation-controller.js | Três deduções e acesso só com prova verificados. |
| 53 | C | Organizar pauta, reparar áudio e interromper retorno. | src/investigation.js, src/content.js | Tarefas completas dão equipamento/apoiadores distintos. |
| 54 | C | Histórico altera fala seguinte, apoio e resolução. | src/investigation-controller.js, src/content.js | Consequência mantida entre capítulos e saves. |
| 55 | V | Finais por prova/acordo/ajuda/polarização e copa com carga. | src/content.js, src/main.js | Mediar/publicar/reload passam; cena final visual pendente. |
| 56 | V | Prólogo, gabinete e manutenção posterior com mapas/perguntas próprias. | src/expansion.js | Três módulos concluídos a pé; validação externa antecipada por autorização do usuário. |
| 57 | C | Duas especializações funcionais por protagonista. | src/rpg.js, src/domain.js | Proteção, interrupção, alcance, fôlego e combo participam das regras. |
| 58 | C | Quatro habilidades entre seis por personagem, fora da arena. | src/rpg.js, src/main.js | Troca, duplicata, save e treino exercitados. |
| 59 | C | Oito peças autorais com origem e função. | src/rpg.js, src/domain.js | Cura/proteção, defesa, interrupção, alcance, combo, apoio, acordo/confronto. |
| 60 | V | Faixa alta dá dano/retorno e risco recebido. | src/domain.js, src/rpg.js | Vantagens/regras existem; viabilidade comparativa humana pendente. |
| 61 | C | Selo de acordo, luvas de confronto e instrumentos das provas. | src/domain.js, BALANCEAMENTO.md | Rotas continuam sem duplicar recompensa. |
| 62 | C | Apoio Nair/Lia/Célia conquistado, recarga e efeito limitado. | src/rpg.js, src/main.js | Comando/cooldown testados; não cria colisão de aliado. |
| 63 | C | Ficha/loadout com efeitos reais e regra de restauração. | src/main.js, src/interface-controller.js | Números derivados das regras, sem atributos decorativos. |
| 64 | C | Treino, desafio e repetição dos três chefes isolados. | src/main.js, src/encounter-controller.js | Save/recompensas isolados, resultado e recorde locais. |
| 65 | V | 26 sons de ação/avisos/interface. | src/audio.js, assets/audio/manifest.json | WAV e buses testados; mix ouvido pendente. |
| 66 | V | Passos por superfície/cadência e eventos de esquiva. | src/main.js, src/audio.js | Parados/pausados não disparam passos; sincronismo ouvido pendente. |
| 67 | V | Paisagens sonoras próprias para copa/estúdio/jardim. | src/audio.js, scripts/export-audio.js | Loops exportados; identidade/fadiga auditiva pendentes. |
| 68 | V | Exploração e combate por capítulo, seis exports. | src/audio.js, assets/audio/manifest.json | Variação e transição programadas; aprovação musical pendente. |
| 69 | V | Avisos por forma e por chefe, com equivalente visual. | src/audio.js, src/encounter-controller.js | Eventos presentes; reconhecimento auditivo pendente. |
| 70 | C | Pan conforme câmera, distância e limite de 24 vozes. | src/audio.js, tests/audio.test.js | Direção invertida, limite e limpeza testados. |
| 71 | C | Geral, efeitos, música, ambiente e botão de teste. | src/audio.js, src/settings.js | Buses ativos respondem a ajuste/mudo; início por ação. |
| 72 | C | Autoria CC0, PCM/WAV/manifesto e sons de interface. | CREDITOS.md, scripts/export-audio.js | Headers, duração e picos individuais testados; mix final exige escuta. |
| 73 | V | HUD nas bordas, feedback breve e menus separados. | src/style.css, src/interface-controller.js | DOM passa; composição 720/1080 não capturada. |
| 74 | V | Tutorial progressivo pulável e treino separado. | src/tutorial.js, src/main.js | Ações marcam progresso; entendimento de jogador novo pendente. |
| 75 | C | Diário com origem/conexões e diário específico dos extras. | src/investigation.js, src/interface-controller.js | Retomada/ficha mostram provas reais e próximo objetivo. |
| 76 | V | Símbolos, norte, altura, portas e regiões fechadas. | src/interface-controller.js | Formas não dependem só de cor; leitura visual pendente. |
| 77 | V | Histórico, escolha explícita, foco e retorno ao diálogo. | src/interface-controller.js, src/main.js | Voltar/Esc conservam contexto; ritmo/texto grande pendentes. |
| 78 | C | Remapeamento com conflito/reserva e foco modal. | src/input.js, src/input-controller.js, src/main.js | Tecla antiga deixa de mover, nova funciona, Tab/Esc tratados. |
| 79 | V | Texto/HUD 85–140%, foco, símbolos/textos e contraste de base. | src/settings.js, src/style.css | Contraste sólido calculado; zoom e imagem final pendentes. |
| 80 | C | Efeitos separados e assistência de dano/janela. | src/settings.js, src/encounter-controller.js | Assistência amplia aviso 35%; mesma história. |
| 81 | C | Controladores de UI, investigação, encontro, entrada/câmera. | src/*-controller.js, src/camera.js | Sessão nova limpa ações; callbacks extras/desafios exercitados. |
| 82 | C | Passo fixo, limite de acumulador, pausa e efeitos determinísticos. | src/simulation.js, tests/action.test.js | 30/60/120 fps equivalentes nas regras; sem RNG não controlado. |
| 83 | C | Schema v4, migrações v2/v3, três slots e checkpoint seguro. | src/domain.js, src/persistence.js | Inválido não substitui válido; novos campos validados. |
| 84 | A | Diagnóstico CPU/renderer/GPU quando extensão disponível. | src/diagnostics.js, src/gpu-timer.js | Sem PC/GPU de referência; metas 60/30 fps NÃO medidas. |
| 85 | V | Descarte de privados, cache de texturas, mixer/áudio/listeners. | src/world.js, src/audio.js, src/input-controller.js | Ciclo de vida revisado; crescimento de memória GPU não medido. |
| 86 | A | Percursos por teclas e runner WebGL com capturas. | tests/walking.integration.js, tests/browser.integration.js | Campanha/extras a pé passam; browser bloqueado; combate contínuo sem reposicionar ainda exige sessão. |
| 87 | C | Validador de IDs/pisos/objetivos e preview F4; parâmetros separados. | src/content-validation.js, src/content-preview.js, src/tuning.js | Validação obrigatória no build; editar encontro não exige UI. |
| 88 | C | Documentação vigente, build estático limpo e relato local. | README.md, src/feedback.js, scripts/build.js | Build e referências verificados; relato sem envio automático. |

## Verificação executada

- Regras de campanha/save/combat, biblioteca de assets, áudio e pipeline GLB/JSON/WAV.
- Integração de menus, história, ambas as rotas, derrota/retomada e isolamento de sessão/save.
- Ambos os protagonistas em dificuldade padrão; rodada adicional em assistência. Registros automatizados em `test-results/balance-*.json` e tabela em BALANCEAMENTO.md.
- Campanha e três módulos adicionais percorridos usando teclas, sem teleporte, com pisos/portas de cada etapa. O caso posterior revelou uma parede que bloqueava a válvula; a abertura foi corrigida e o percurso passou.
- Interações ambientais dos três capítulos, puzzles, segredos e persistência.
- Loadout, recarga de apoio, remapeamento, buffer de esquiva, histórico de conversa e resultado do desafio.
- Build e validador de conteúdo. Export de arredondamento/matrizes foi corrigido após o teste detectar dimensões diferentes no JSON.

O runner de browser está preparado e falha de forma explícita neste ambiente. As revisões humana/visual/auditiva e o perfil GPU precisam ocorrer em um navegador permitido, usando a versão atual. Elas podem gerar novo trabalho nos itens em validação; não foram substituídas por testes de DOM.

## Organização e manutenção

Regras ficam em domain/rpg/combat/encounters; a entrada normaliza/remapeia no InputRouter; UI, investigação e encontros têm controladores separados. Mapas, conteúdo, ajustes de movimento e módulos são dados editáveis. Mudar de sessão limpa ação pendente e efeitos; extras e replays não regravam slots nem entregam recompensas da campanha. O formato continua local/offline.

A revisão anterior v0.5 foi incorporada. O plano de produto antigo permanece como histórico, com ponte para a documentação vigente. Multiplayer, cidade aberta e veículos permanecem fora dos 88 itens autorizados.

