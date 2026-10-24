# Personagens do "Jogar contra o computador"

Tudo de um personagem fica em **um arquivo**: `src/content/personagens.ts`.
Os desenhos ficam em `public/personagens/<id>/`.

## Editar um personagem

Abra `src/content/personagens.ts` e mude o que quiser no bloco dele:

| Campo | O que é |
|---|---|
| `nome`, `titulo`, `descricao` | Textos da trilha e da tela de partida. |
| `cor` | Cor do personagem (borda do balão e do cartão na trilha). |
| `eloAprox` | Força aproximada mostrada ao aluno ("~1400"). Só orienta; não muda a força. |
| `estilo` | `agressivo`, `defensivo`, `posicional` ou `tatico`. Desempata entre lances parecidos. |
| `frases` | Falas por situação: `intro`, `bomLance`, `erro`, `captura`, `xeque`, `vitoria`, `derrota`, `empate`. Pode ter quantas quiser em cada uma; uma é sorteada. Os lances citados são os do **aluno** (ex.: `erro` = o aluno errou; `vitoria` = o aluno venceu). |
| `aberturas` | Linhas em notação SAN a partir da posição inicial (`["e4", "e5", "f4"]`). Enquanto a partida segue o começo de uma linha, o personagem joga o próximo lance dela. |
| `ajudas` | Quantos "desfazer" e quantas dicas o aluno tem por partida. |
| `motor` | A força (veja abaixo). |

Sem colchetes nas falas: o teste automático recusa (são marcadores de texto pendente).

### Força (`motor`)

- **`mode: "multipv"`** (níveis 1 a 6): o motor lista os melhores lances e a Finale escolhe.
  - `depth`: profundidade da busca (6 a 12 é o razoável no celular).
  - `multipv`: quantos lances candidatos (2 a 5).
  - `randomChance`: chance de jogar um lance legal qualquer (0 a 1). Use só nos primeiros níveis.
  - `mistakeChance`: chance de não jogar o melhor candidato.
  - `mistakeWeights`: pesos do 2º, 3º, 4º candidato (decrescentes, ex.: `[4, 2, 1]`).
  - `maxLossCp`: o "erro humano" nunca perde mais que isso em centipeões (100 = um peão).
  - `styleWindowCp`: diferença máxima em que o estilo pode trocar o melhor lance por outro.
- **`mode: "elo"`** (níveis 7 a 9): o próprio Stockfish limita a força. `elo` de 1320 a 3190; `movetimeMs` é o tempo por lance.
- **`mode: "maximo"`** (nível 10): força total, com `movetimeMs` por lance.

Para deixar um nível **mais fácil**: aumente `mistakeChance`, `randomChance` ou `maxLossCp`, ou diminua `depth`/`elo`. Para **mais difícil**, o contrário. Os testes conferem que os níveis continuam em ordem de dificuldade.

## Trocar o desenho

Cada personagem tem 4 arquivos (mesmo tamanho, quadrados, de preferência SVG):

```
public/personagens/<id>/normal.svg
public/personagens/<id>/feliz.svg       (o aluno errou, o personagem venceu)
public/personagens/<id>/preocupado.svg  (o aluno jogou bem ou venceu)
public/personagens/<id>/surpreso.svg    (captura ou xeque do aluno)
```

Basta substituir os arquivos mantendo os nomes. Os desenhos atuais são gerados por
`node scripts/gerar-avatares.mjs` (desenhos originais da Finale); se trocar por arte
própria, não rode mais o script para esse personagem (ele sobrescreve). Use só arte
própria ou com licença que permita uso comercial, e anote a origem em `/creditos`.

## Criar um personagem novo

1. Copie um bloco em `BOTS`, troque o `id` (só letras minúsculas, números e hífen; vira o endereço `/jogar/<id>`) e o `nivel`.
2. Crie a pasta `public/personagens/<id>/` com os 4 desenhos.
3. A ordem da trilha é a ordem do array. O teste espera 10 níveis numerados de 1 a 10 e um único `chefe: true` no fim; se mudar a quantidade, ajuste `src/lib/bot/config.test.ts`.
4. Rode `npm run test`.

O progresso dos alunos é guardado pelo `id`: **não troque o id** de um personagem que já está no ar (o progresso dele se perde).
