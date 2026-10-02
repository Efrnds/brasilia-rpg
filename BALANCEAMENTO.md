# Balanceamento v0.6

Estado: regras implementadas e simulações reproduzíveis; balanceamento com jogadores ainda pendente. Os resultados abaixo não medem duração da campanha, dificuldade percebida ou desempenho gráfico.

## Parâmetros atuais

| Sistema | Valor / comportamento |
|---|---|
| Movimento | Caminhada 5,2; corrida 7,6; guarda 2,4 unidades/s |
| Corrida | Consome 48 stamina/s, sem regeneração simultânea |
| Buffer | Ataque e esquiva aceitam entrada antecipada de 0,16 s |
| Habilidades | Recuperação de 0,65 s; quatro equipadas dentre seis por personagem |
| Guarda | Quebra por 1,4 s; equipamento reduz custo de 12 para 8 |
| Interrupção | Resistência temporária de 2,5 s evita travar o inimigo indefinidamente |
| Cura | Três cargas; quarta por missão secundária; restauração em checkpoint de encontro |
| Apoio | Recarga de 24 s, ou 18 s com roteador |
| Chefes | Vida base 270 / 310 / 360; preparação de ataques entre 1,05 e 1,65 s |
| Polarização alta | A partir de 75: dano básico +12%, habilidade +15%, dano recebido +15% |

Provas reduzem dano inimigo em 6%. Acordos anteriores acrescentam recuperação. Comissão, câmeras e relé alteram seus respectivos encontros. Guardas são direcionais; suportes têm cura limitada. Especializações e equipamentos modificam regras, e não apenas descrições.

## Simulação automatizada em dificuldade normal

Método: cena e lógica reais, renderer simulado, posicionamento por teleporte para preparar combates e entradas automatizadas. O tempo é o do encontro simulado; exclui exploração e diálogo. A seleção de habilidades não representa um jogador médio. Fontes: `test-results/balance-luli-normal.json` e `test-results/balance-folfonaro-normal.json`.

| Personagem | Capítulo | Segundos | Dano causado | Dano recebido | Ataques / acertos | Derrotas |
|---|---|---:|---:|---:|---:|---:|
| Luli | 1 | 16,93 | 400 | 66 | 23 / 23 | 0 |
| Luli | 2 | 13,47 | 460 | 29 | 17 / 17 | 0 |
| Luli | 3 | 14,08 | 610 | 57 | 18 / 18 | 0 |
| Folfonaro | 1 | 13,88 | 400 | 50 | 19 / 19 | 0 |
| Folfonaro | 2 | 12,78 | 460 | 29 | 17 / 17 | 0 |
| Folfonaro | 3 | 12,82 | 610 | 57 | 17 / 15 | 0 |

Esses resultados confirmam que as duas rotas de combate podem terminar e produzir métricas. Não demonstram equivalência entre personagens: equipamentos, uso de habilidades e posicionamento da automação influenciam o resultado. As durações curtas precisam ser confrontadas com sessões humanas antes de ajustar vida ou dano indiscriminadamente.

## Validações restantes

Medir primeira sessão de cada personagem: tempo por trecho, mortes, cargas gastas, ataques evitados, habilidade escolhida e pontos de desorientação. Repetir com e sem minimapa, em dificuldade normal, alternando combate e negociação. Registrar compreensão dos sinais de dano, guarda, preparação e recuperação antes de alterar números.

O percurso por teclas já verifica conectividade das três campanhas e dos três extras. Ainda falta um percurso humano contínuo de combate, avaliação visual/sonora e medição em GPU real. Os itens 16, 24, 84 e 86 permanecem em andamento em `IMPLEMENTACAO.md`.
