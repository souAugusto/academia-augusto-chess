# Prompt: perfil editável, tabuleiro/peças/sons personalizáveis, rating tático e títulos

> Recebido do Augusto em 2026-10-14. Adaptações ao projeto real estão em `docs/DECISOES.md`
> (Asaas em vez de Stripe, react-chessboard em vez de chessground, migration 0014 em vez de
> "0002", `/taticas` em vez de `/puzzles`, e o Bloco B usa o rating de táticas que já existe).

Leia o `CLAUDE.md` e o `PROMPT_MESTRE.md` antes de começar. Este prompt **acrescenta** funções ao projeto que já está no ar. Não mude o que já funciona (planos, Stripe, regras de acesso) e não troque cores, fontes ou textos existentes.

Trabalhe em **dois blocos**. Ao fim de cada bloco: lint, testes, build, deploy de preview, resumo do que mudou e **pare para eu validar**.

- **Bloco A:** perfil editável + personalização do tabuleiro, das peças e dos sons.
- **Bloco B:** rating tático do aluno + títulos por nível (com celebração) + ranking.

Antes de cada bloco, diga em 5 linhas o que vai fazer e o que pode dar errado.

---

## 0. Banco de dados

Existe o arquivo `supabase/migrations/0002_perfil_titulos.sql` (já escrito). Ele:
- acrescenta em `profiles`: `display_name` (único), `bio` (até 160), `avatar_path`, `show_in_ranking`, `preferences` (jsonb, até 2 KB);
- cria o bucket de storage `avatars` (público para leitura, 2 MB, só jpeg/png/webp, cada usuário escreve só na própria pasta `{user_id}/`);
- cria `player_stats`, `rating_history`, `titles` e `user_titles`, com a escada de títulos já cadastrada;
- cria a função `apply_puzzle_result(user, puzzle, solved)` (só servidor) e `get_ranking(limit)`.

Passos: confira se o arquivo bate com o schema atual (`0001_init.sql`), aplique em desenvolvimento, rode `get_advisors` / verificação de segurança do Supabase, gere os tipos TypeScript de novo. **Peça minha confirmação antes de aplicar em produção.** Se algo no SQL falhar ou conflitar com o que já existe, corrija criando um `0003_...sql`, sem editar migrations já aplicadas.

---

## BLOCO A: perfil e personalização

### A1. Perfil editável (`/conta/perfil`)

Cada usuário edita **somente o próprio** perfil. Campos:

| Campo | Regra |
|---|---|
| Nome de exibição (apelido) | 3 a 20 caracteres: letras, números, `_`, `.` e `-`. Único (sem diferenciar maiúscula/minúscula). Mostrar erro claro se já existir. Pode trocar no máximo 1 vez a cada 30 dias. |
| Nome | Texto livre curto, privado (não aparece no ranking). |
| Bio | Até 160 caracteres, texto simples (sem HTML). |
| Foto (avatar) | Upload de jpeg/png/webp até 2 MB. Redimensionar para 256×256 e converter para webp **no servidor**, removendo metadados EXIF (inclui GPS). Salvar em `avatars/{user_id}/avatar.webp`. Botão "Remover foto" volta para um avatar padrão (iniciais do apelido). |
| WhatsApp | Opcional, privado, com validação de formato brasileiro. |
| Aparecer no ranking | Liga/desliga (`show_in_ranking`). Padrão: ligado, explicado em uma linha. |

Também nesta área:
- **Trocar e-mail** e **trocar senha** pelo Supabase Auth (com confirmação por e-mail).
- **Excluir conta**: confirmação digitando o apelido; cancela a assinatura no Stripe, apaga perfil, avatar e dados, e desloga. Registre o que foi apagado.
- Mostrar o plano atual e o título atual, só leitura, com link para `/conta`.

Regras:
- Valide tudo no servidor com Zod. Nunca confie no que vem do navegador.
- Bloqueie apelidos ofensivos com uma lista simples de palavras proibidas em português (arquivo editável) e reserve nomes como `admin`, `augusto`, `augustochess`, `suporte`, `moderador`.
- O **ranking e perfis públicos mostram só**: apelido, foto, título e rating tático. Nunca e-mail, nome real, WhatsApp ou bio privada. Se eu quiser bio pública depois, é uma decisão à parte.
- No admin (fase de admin) deve existir a ação "resetar apelido/foto" para moderação. Se o admin ainda não existe, deixe a função pronta no servidor e anote como pendência.
- Acessibilidade: labels em todos os campos, mensagens de erro ligadas ao campo, foco visível.

### A2. Preferências do tabuleiro, peças e sons

Painel único, aberto por um **ícone de engrenagem no cabeçalho do tabuleiro** (modal no desktop, bottom sheet no celular) e também na página `/conta/aparencia`. Tem **pré-visualização ao vivo**: um tabuleiro pequeno que muda na hora que o aluno escolhe.

*Tabuleiro:* tema de cores (Academia verde e creme, Madeira, Azul, Cinza, Roxo, Alto contraste), coordenadas (dentro/margem/ocultas), destacar último lance, lances possíveis, velocidade da animação (desligada/rápida/normal/lenta), forma de mover (arrastar/clicar/ambos), promoção automática para dama.
*Peças:* de 3 a 5 conjuntos com visual bem diferente.
*Sons:* ligados/desligados, volume 0–100 (padrão 50), 2 pacotes; eventos: movimento, captura, xeque, roque, promoção, lance correto, lance errado, puzzle resolvido, fim de ciclo, título conquistado.

**Armazenamento:** visitante em `localStorage`; logado em `profiles.preferences` com `localStorage` como cache; no primeiro login, se o servidor não tem preferências, envia as locais; se tem, o servidor manda. Zod, chaves desconhecidas descartadas, limite de 2 KB, botão "Restaurar padrão".

**Aplicação:** um único componente de tabuleiro (`<ChessBoard />`) com hook `useBoardPreferences`, usado por todas as telas com tabuleiro (Home decorativa usa o tema padrão).

**Motor de sons (`src/lib/sound`):** `playSound(evento)`, Web Audio com sons em memória ou sprite, pré-carga só do pacote escolhido depois da primeira interação, destravar o áudio no primeiro toque, respeitar silêncio e volume, arquivos pequenos, testar em Chrome, Safari (iPhone) e Firefox.

**Licenças (obrigatório, o site é comercial):** só recursos com licença que permita uso comercial (preferir CC0, MIT, BSD ou conteúdo próprio); nada do Chess.com ou de produto proprietário; para cada recurso, confirmar a licença na fonte, colar texto/link em `docs/licencas/` e listar em `/creditos`; se não houver opção segura, usar só o que for seguro e avisar.

### Critérios de aceite do Bloco A

1. Edito apelido, bio, foto e visibilidade no ranking, recarrego e tudo persiste. Dois usuários não conseguem o mesmo apelido.
2. Um usuário não consegue ler nem alterar o perfil de outro (testar com duas contas).
3. Foto de 5 MB, arquivo `.exe` renomeado para `.jpg` e imagem com GPS no EXIF são rejeitados ou limpos.
4. Mudo o tema, as peças e o volume no painel, vejo na hora no tabuleiro de pré-visualização, e a escolha vale em todas as telas, inclusive depois de sair e entrar de outro aparelho.
5. Os sons tocam no iPhone e no Android depois do primeiro toque; com som desligado, nada toca.
6. Nenhum conjunto de peças ou som sem licença documentada em `docs/licencas/` e em `/creditos`.
7. `/creditos` atualizado. Lint, testes e build passando.

**Pare aqui e espere minha validação antes do Bloco B.**

---

## BLOCO B: rating tático, títulos e ranking

### B1. Rating tático
Rating que muda conforme resolve puzzles do Lichess. Só a primeira tentativa de cada puzzle conta. Não contam: puzzles personalizados, ciclos do Método, revisão, puzzle do dia e puzzles sem rating. Dica ou "Ver solução" = errado. Fluxo no servidor: validar sessão e plano, conferir os lances com chess.js (mate alternativo vale), checar plausibilidade (tempo mínimo, limite de taxa) e só então atualizar o rating com a service role; devolver rating antes/depois e títulos novos. Documentar em `docs/DECISOES.md` que o ranking é de motivação (as soluções são legíveis pelo aluno).

### B2. Títulos (escada editável pelo admin)

| Rating tático | Título | Frase de efeito |
|---|---|---|
| 0 | Aprendiz do Tabuleiro | Toda lenda começou movendo um peão. |
| 900 | Peão Valente | Já enxerga as primeiras armadilhas. |
| 1100 | Cavaleiro Tático | Os garfos agora são a sua marca. |
| 1300 | Caçador de Táticas | Nenhuma peça solta escapa do seu olhar. |
| 1500 | Promessa da Academia | A academia já fala o seu nome. |
| 1600 | Jogador Experiente | Poucos chegam aqui. Você chegou. |
| 1800 | Jogador Forte | Os adversários já pensam duas vezes. |
| 2000 | Mestre das Táticas | Você calcula onde os outros apenas torcem. |
| 2200 | Algoz do Tabuleiro | Cada posição é uma sentença. |
| 2400 | Lenda da Academia | O topo da escada. Poucos o verão de perto. |

Título só depois de 30 puzzles contados; título conquistado é permanente (exibe o mais alto); não usar títulos oficiais da FIDE ou da federação.

### B3. Telas e efeitos
Selo do título (painel, perfil, ranking), barra de progresso no painel (e "Calibrando: X de 30"), celebração em tela cheia ao conquistar título (selo animado, Fraunces, frase, som, confete em canvas leve, respeitando `prefers-reduced-motion`; botões Continuar e Compartilhar), imagem para compartilhar (`ImageResponse`, quadrada e vertical, sem dados privados), página `/titulos`, ranking em `/comunidade` (só quem tem `show_in_ranking`, 30+ puzzles e plano ativo; destaca o próprio aluno) e aviso fixo: *"O rating tático é medido nos puzzles da academia e não equivale ao rating de partidas (Chess.com, Lichess ou FIDE)."*

### Critérios de aceite do Bloco B
1. Testes da conta do rating e da rota (sem plano, lances inválidos, tentativas implausíveis).
2. O mesmo puzzle duas vezes não muda o rating na segunda.
3. Puzzle do dia, ciclos e revisão não alteram o rating.
4. Usuário de teste levado a 30 puzzles e a 1600: celebração uma vez por título, selo muda, título não some se o rating cair.
5. RLS: ninguém vê ou edita stats/títulos de outro, nem chama a função de rating direto.
6. Ranking não vaza e-mail, nome real nem WhatsApp; quem desliga some.
7. Celebração respeita `prefers-reduced-motion` e funciona no celular.
8. Aviso do rating no painel e em `/titulos`.
9. Lint, testes e build; `docs/DECISOES.md` atualizado.

## Entrega
Depois de cada bloco: arquivos alterados, capturas (1440×900 e 390×844), como testar e pendências. Se uma decisão for necessária, perguntar uma vez, com recomendação.
