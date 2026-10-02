# Oficina: pack reutilizável v3

13 props: banco, cadeira, mesa, estante, câmera, caixa, carrinho de café, vaso, poste, árvore, armário com portas, console e válvula. Nove módulos arquitetônicos: parede, canto, porta, janela, piso, escada, rampa, corrimão e coluna. Seis personagens compartilham um rig de membros rígidos com 12 clips autorais: repouso, andar, correr, ataque, habilidade, defesa, esquiva, dano, morte, vitória, conversa e operação.

A galeria em `/assets/pack/gallery.html` permite girar, aproximar, escolher clips, visualizar dimensões e exportar JSON/GLB. Inclui uma amostra com personagem, inimigo, móvel e arquitetura. Ainda exige aprovação visual em câmera de jogo.

Modelos exportados em `models/`, manifesto em `manifest.json`. Escala em metros, Y para cima, pivô central no chão. Props informam footprint X/Z; arquitetura informa dimensões X/Y/Z. Colisores devem ser registrados na cena que importa o modelo. A rampa também informa perfil de altura. `variant` inteiro altera distribuição da vegetação sem aleatoriedade.

```js
import { placeProp } from './assets/pack/props.js';
placeProp(scene, 'bench', { x: 2, z: 4, rotation: Math.PI / 2 });
```

JSON usa `THREE.ObjectLoader`; GLB segue glTF 2.0 e preserva geometria, hierarquia, materiais PBR e clips por transformações. O rig usa malhas presas aos ossos: não há skinning de superfície contínua. GLB usa materiais de cor sólida; texturas procedurais locais pertencem ao runtime, não são embutidas no GLB. JSON inclui geometria arredondada já transformada e matrizes atualizadas para preservar dimensões.

Autoria local por código, sem modelos de lojas, imagens externas ou assets de outros jogos. Modelos, materiais, clips e código do pack: CC0-1.0. Three.js mantém licença MIT em `vendor/`.

`npm run assets:build` reexporta modelos e áudio. A cena deve descartar geometrias e materiais privados quando remove objetos. Texturas compartilhadas são mantidas pelo cache de materiais; use `disposeSurfaceTextures()` somente ao encerrar o conjunto inteiro. O áudio tem manifesto próprio em `assets/audio/manifest.json`.
