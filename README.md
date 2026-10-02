# Brasília: O Último Debate

RPG 3D de ação individual para PC no navegador, v0.6. Três capítulos com investigação, negociação ou confronto; dois protagonistas ficcionais; equipamento, especializações e apoio aliado. Prólogo, gabinete de investigação, caso posterior e desafios ficam separados do save da campanha.

Para jogar, com Node.js 20+ e navegador com WebGL 2:

```sh
npm run dev
```

Abra http://localhost:5173. Não precisa instalar pacotes para jogar. Todos os recursos são locais; abrir `index.html` por duplo clique não carrega os módulos corretamente. `npm run build` cria `dist/` para hospedagem estática, e `npm run preview` serve essa pasta.

## Controles padrão

| Entrada | Ação |
|---|---|
| WASD | Movimento relativo à câmera |
| Mouse arrastado/capturado ou setas | Câmera |
| Clique esquerdo / F | Ataque |
| Clique direito / Q | Defesa frontal |
| Espaço | Esquiva |
| Shift | Corrida: 48 de fôlego/s, sem regeneração simultânea |
| 1 a 4 | Habilidades equipadas |
| E | Interagir |
| J | Diário |
| R / T | Fixar/liberar alvo / trocar alvo |
| C | Apoio aliado |
| Esc | Pausa ou retorno do menu atual |
| F3 / F4 | Métricas locais / preview de colisores, spawns e alcance |

Configurações remapeiam teclas, separam sensibilidade e inversões, FOV, captura do mouse, texto/HUD, minimapa, volumes e efeitos. Habilidades/equipamento podem ser trocados pela pausa fora da arena. Cada protagonista tem seis habilidades e equipa quatro. A seleção oferece pátio de treino para experimentar sem alterar a campanha.

Ataque básico: preparação com acerto em 0,20 s, recuperação total de 0,55 s e buffer de 0,16 s. Esquiva: 25 de fôlego, proteção/deslocamento por 0,32 s e recarga de 0,8 s. Pode cancelar ataque após a preparação; habilidade só permite cancelar na recuperação final. Conjuração/recuperação de habilidades evita disparar todas simultaneamente. Checkpoints de encontro restauram vida, fôlego, recargas e três cargas de cura; tarefa concluída dá quatro. A faixa de polarização a partir de 75 aumenta dano/retorno e também o dano recebido.

## Campanha e assets

Palácio: protocolos e braços/comissões. Estúdio: vídeo cronológico, áudio, console e câmeras que amplificam o chefe. Jardim: mensagem original, relé que bloqueia reforços e ponte de retorno. Tarefas de apoio têm verbos e equipamentos próprios; acordos e confronto dão ferramentas diferentes. Provas, ajuda, escolhas e polarização chegam ao epílogo com os 37 pacotes de volta à copa.

[História](HISTORIA.md), [pack reutilizável](assets/pack/README.md), [créditos](CREDITOS.md). A galeria está em `/assets/pack/gallery.html`: 13 objetos, nove módulos, seis personagens, clips e amostra de arte, com exports JSON/GLB. `npm run assets:build` refaz os exports e WAV.

## Saves e testes

Três slots locais, exportação/importação na pausa, schema v4 com migração de saves v2/v3. Importação inválida preserva o save anterior. Restaurar usa checkpoint seguro por capítulo/etapa; equipamentos, provas e interações descobertas persistem. Limpar dados do navegador apaga slots: exporte uma cópia pela pausa.

```sh
npm install
npm test
npm run test:ui
npm run test:walk
npm run test:expansion
npm run test:environment
npm run validate
npm run build
```

Testes de regras/pack usam só Node; integrações de DOM requerem `happy-dom`. `BRASILIA_NORMAL_COMBAT=1` usa dificuldade padrão, e `BRASILIA_FIRST_CHARACTER=folfonaro` inverte os protagonistas testados. `test:walk` percorre campanha e três extras usando teclas, sem teleporte. Testes de combate reposicionam alvos para conferir regras; não aprovam imagem ou sensação de controle.

`npm run test:browser` usa Playwright e um Chromium local, configurável por `BRASILIA_BROWSER_PATH`. Faz smoke em renderer WebGL real, capturas 1280×720/1920×1080 e galeria. `BRASILIA_PLAYWRIGHT_MODULE` e `BRASILIA_DOM_MODULE` permitem usar instalações locais das ferramentas. O teste registra falha em `test-results/browser/failure.txt` se o navegador não iniciar; não transforma esse bloqueio em aprovação.

## Estado da entrega

[IMPLEMENTACAO.md](IMPLEMENTACAO.md) rastreia os 88 itens do [plano](PLANO_MELHORIAS.md), incluindo limitações e critérios ainda em validação. Nesta execução passaram regras, exports, integração, duas rotas, ambos os personagens em dificuldade padrão e percursos da campanha/extras. O sandbox bloqueou servidor e Chromium; imagem, áudio ouvido, sessões humanas, perfil GPU e metas de desempenho não foram aprovados.

F3 reúne fps, p95, CPU, draw calls, geometria/texturas e tempo GPU quando a extensão do navegador permite. Pela pausa, “Exportar relato de problema” gera um JSON local com versão, etapa, configuração e métricas; complete os passos e anexe capturas antes de compartilhar. Nenhuma informação é enviada automaticamente.

`PLANO_PRODUTO.md` e `prototipo-v0.1.html` são histórico de concepção; não fazem parte do build de distribuição.
