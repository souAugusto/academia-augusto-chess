# Prompt mestre: Academia Augusto Chess

Você é o desenvolvedor sênior deste projeto. Leia este arquivo inteiro, depois o `CLAUDE.md` e o `supabase/migrations/0001_init.sql`. Trabalhe em **fases** (seção 9). Ao fim de cada fase, rode os testes, faça o deploy de preview, resuma o que foi feito e **pare para eu validar** antes da próxima.

O dono do projeto é o Augusto (não é desenvolvedor sênior de produto, mas conhece Next.js, Vercel e Supabase). Explique decisões em português, de forma direta.

---

## 1. Objetivo

Site de assinatura de uma academia de xadrez, alimentado pelas lives diárias do Augusto no TikTok. A live atrai o público; o site vende duas assinaturas e entrega o conteúdo:

- **Membro, R$ 19/mês:** puzzles com rating e revisão de erros, aulas em vídeo (com material em PDF e PGN), lives exclusivas, ranking, torneios e grupo no WhatsApp.
- **Intensivo, R$ 119/mês, turma limitada a 10 alunos:** tudo do Membro, mais o **Método Augusto Chess**, diagnóstico das partidas, plano de treino individual, revisões ao vivo na turma de até 10 alunos, grupo exclusivo da turma no WhatsApp, prioridade nas lives e **1 aula por mês com um mestre nacional em atividade** (conteúdo cadastrado no admin; sem nome de mestre no site por enquanto).

**Não existe plano gratuito.** Sem assinatura ativa, a conta existe mas não acessa nada além da Home, da página de planos e do puzzle do dia (isca pública).

O **Método Augusto Chess** é um treino por ciclos de repetição de táticas: o aluno refaz o mesmo conjunto várias vezes, cada ciclo mais rápido, e os erros voltam por repetição espaçada. O método é de longo prazo, cada aluno tem seu ritmo: **não há número fixo de ciclos nem prazo**. Não prometa ganho de rating em nenhum texto.

## 2. Stack (não troque sem me avisar)

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase: Auth (e-mail/senha + Google), Postgres, RLS. Use `@supabase/ssr`.
- Stripe: Checkout (assinatura), webhooks, Customer Portal
- Tabuleiro: `react-chessboard` (MIT) + `chess.js` (BSD), com as peças Cburnett (licença BSD, em `public/pieces/cburnett/`). Decisão de 2026-10-07: o `chessground` foi descartado por ser GPL-3.0.
- Vídeo das aulas: Bunny Stream (fase 4, com URLs assinadas geradas no servidor). Antes disso, deixe o campo `video_id` e um player placeholder.
- Deploy: Vercel (repo no GitHub, deploy automático)
- Testes: Vitest para a lógica pura (revisão espaçada, ciclos, validação de lances)
- Fuso padrão para "dia" (puzzle do dia, sequência diária): `America/Sao_Paulo`
- Stockfish no navegador: **fora do escopo agora** (futuro: finais; atenção à licença GPL)

## 3. Identidade visual

Estilo escuro e elegante, verde profundo com dourado. Fontes: **Fraunces** (títulos) e **Manrope** (texto), via `next/font`.

| Token | Valor |
|---|---|
| fundo | `#0E241D` |
| fundo profundo (faixas) | `#0B1D17` |
| superfície (cards) | `#143128` |
| superfície alta (destaque) | `#1B3F33` |
| borda | `#1F4538` |
| borda forte | `#3C6B58` |
| texto | `#F3EFE4` |
| texto secundário | `#C9D6CE` |
| texto discreto | `#A9B9B0` |
| dourado (acento) | `#D4AF57` (texto escuro sobre dourado: `#0E241D`) |
| tabuleiro claro / escuro | `#E8DDC0` / `#5E8B6F` |

Regras: botões e áreas de toque com no mínimo 44px; contraste mínimo 4.5:1; layout responsivo (funciona bem em celular, boa parte do público vem do TikTok no telefone); `<button>`, `<a>`, `<label>` semânticos; sem emojis; ícones só em SVG.

Os desenhos de referência (Home, Treino, Entrar) estão em `docs/design/`. Reproduza com fidelidade e adapte ao componente real.

## 4. Planos e regras de acesso

- `plans.rank`: Membro = 1, Intensivo = 2. Intensivo inclui tudo do Membro.
- Acesso é decidido no **servidor** (e reforçado pelo RLS, já criado no SQL). Nunca confie só em esconder botão.
- Status que dão acesso: `active`, `trialing`, `past_due` (com tolerância de 3 dias após `current_period_end`). Qualquer outro, sem acesso.
- Concessão manual pelo admin: linha em `subscriptions` com `source = 'manual'`.
- Links dos grupos de WhatsApp ficam em `app_settings` (`whatsapp_membros_url`, `whatsapp_intensivo_url`). Mostre o convite só na área logada (página Comunidade e Conta), só para quem tem o plano correspondente, entregue por uma server action ou route handler. Nunca no HTML público.

## 5. Telas

**Públicas**
- `/` **Home** (seções, nesta ordem): cabeçalho (logo, Puzzle do dia, Benefícios, Método, Planos, Dúvidas, Entrar, botão Assinar); herói ("Treine xadrez todo dia e evolua junto com a comunidade.", CTAs "Quero ser membro" e "Resolver o puzzle do dia", linha "Lives diárias no TikTok · @augustochess", com link para https://www.tiktok.com/@augustochess); tabuleiro do puzzle do dia; card "Próxima live" (lido de `live_events`); 6 benefícios; "Como entrar na academia" (3 passos); seção do **Método Augusto Chess** (4 fases: Diagnóstico, Seu conjunto de táticas, Ciclos de repetição, Revisão ao vivo); **Planos** (Membro e Intensivo); Dúvidas frequentes; chamada final; rodapé.
- No card do **Intensivo**, mostre as vagas restantes ("Restam X de 10 vagas") usando `intensivo_seats_left()`. Com 0 vagas: botão vira "Entrar na lista de espera" (e-mail em `waitlist`).
- `/puzzle-do-dia` puzzle do dia, público, jogável.
- `/entrar` Login e Criar conta (abas), campos nome, e-mail, WhatsApp (opcional), senha, aceite dos termos, "Continuar com Google". Após cadastro, leve para `/planos`.
- `/planos` escolha do plano e início do checkout. `/termos`, `/privacidade`.

**Área do aluno (logado, com plano)**
- `/painel` resumo: sequência diária, rating, revisão de hoje, próxima live, continuar aula.
- `/puzzles` treino por tema e dificuldade, com rating do aluno e erros indo para `review_state`.
- `/aulas` e `/aulas/[id]` cursos, módulos, aulas com vídeo e tabuleiro (FEN/PGN) ao lado, marcar como concluída, baixar PDF/PGN. Curso exige `plan_required`.
- `/treino` (**Intensivo**) Método Augusto Chess, ver 6.
- `/comunidade` agenda de lives, ranking, convite do WhatsApp do plano.
- `/conta` plano atual, próxima cobrança, botão "Gerenciar assinatura" (Stripe Customer Portal), convite do WhatsApp.

**Admin (`/admin`, só quem está em `admins`)** fase 4: aulas (cursos, módulos, aulas, upload de vídeo e arquivos), puzzle do dia (calendário), conjuntos oficiais (escolher puzzles por tema e rating), lives, membros (lista, status, conceder/revogar acesso manual), configurações (links de WhatsApp), vagas do Intensivo e progresso dos alunos.

## 6. Método Augusto Chess (`/treino`)

**Conceitos**
- **Conjunto** (`puzzle_sets`): lista ordenada de puzzles. Pode ser **oficial** (criado por mim, `is_official`) ou **do aluno** (`owner_id`). O aluno do Intensivo pode adicionar táticas ao seu conjunto: a partir dos puzzles do banco, ou colando um **FEN + solução** (ou um PGN de partida dele, escolhendo a posição). Táticas custom são salvas em `puzzles` com `source = 'custom'` e `first_move_is_setup = false`.
- **Ciclo** (`cycles`): uma passada completa pelo conjunto. O aluno refaz o conjunto quantas vezes quiser. A tela mostra **"Ciclo N"** (sem total), progresso "X de Y resolvidos", tempo do puzzle atual, tempo do ciclo atual, tempo do ciclo anterior e uma tabela de histórico (tempo total, acertos, diferença para o ciclo anterior).
- Regra padrão: ordem fixa dentro de cada ciclo (opção de embaralhar nas configurações do conjunto). Lance errado: marca o puzzle como errado, mostra a solução, segue para o próximo. O ciclo termina quando todos os puzzles foram tentados; `total_seconds` é a soma dos tempos (cronômetro pausa se a aba ficar em segundo plano, e há um limite máximo por puzzle para ignorar abandono).
- Cada tentativa grava em `attempts` (com `cycle_id`) e atualiza `review_state`.

**Revisão espaçada (variação simples do SM-2), em função pura e testada:**
- Erro: `repetitions = 0`, `interval_days = 0`, `lapses += 1`, `ease = max(1.3, ease - 0.2)`, `due_at = agora + 10 minutos`.
- Acerto: `repetitions += 1`; `interval_days = 1` se repetitions = 1, `3` se = 2, senão `round(interval_days * ease)`; `due_at = agora + interval_days`.
- Acerto muito mais rápido que a mediana do próprio aluno naquele puzzle: `ease += 0.05`.
- O painel mostra "N puzzles com erro voltam hoje" (`due_at <= agora`) e o botão "Revisar agora" abre uma fila só desses.

**Tabuleiro:** `react-chessboard` + `chess.js`. Orientação pelo lado que joga. Promoção com escolha de peça. Para puzzles do Lichess, `moves[0]` é o lance do adversário aplicado automaticamente; o aluno joga a partir de `moves[1]`. Resposta correta = lance da solução; no Lichess, qualquer lance que dê mate também vale como correto.

## 7. Pagamentos (Stripe)

- Produtos e preços criados no painel do Stripe (**modo teste primeiro**). IDs em variáveis de ambiente (`STRIPE_PRICE_MEMBRO`, `STRIPE_PRICE_INTENSIVO`) e espelhados em `plans.stripe_price_id`.
- `POST /api/checkout`: exige usuário logado; para o Intensivo, chame `reserve_intensivo_seat` (service role) **antes** de criar a sessão; se retornar `false`, responda "turma completa" e ofereça a lista de espera. Crie a Checkout Session em modo `subscription`, com `metadata.user_id` e `metadata.plan_id`, e `customer` reaproveitado quando existir.
- **Pix:** a disponibilidade de Pix **recorrente** para assinaturas no Stripe Brasil muda com o tempo. Consulte a documentação atual do Stripe antes de implementar. Se Pix recorrente não estiver disponível: cartão com cobrança automática + opção de pagar um período via Pix avulso, que libera o acesso por 30 dias e dispara aviso de renovação. Me diga qual caminho foi possível antes de seguir.
- `POST /api/stripe/webhook`: valide a assinatura com o corpo bruto (`STRIPE_WEBHOOK_SECRET`); registre o evento em `stripe_events` (ignore se já existir, idempotência). Trate: `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`. Faça upsert em `subscriptions` por `stripe_subscription_id` e apague a `seat_reservations` do usuário. Tudo com a service role, só no servidor.
- Cancelamento e troca de cartão: Stripe Customer Portal. Ao cancelar, o acesso vai até o fim do período pago.
- Pergunte-me antes de ligar o modo ao vivo. Antes disso, teste o fluxo completo em modo teste: compra, falha de pagamento, cancelamento, reativação, última vaga do Intensivo.

## 8. Segurança e qualidade (inegociável)

1. Nenhuma chave no código nem no Git. `.env.local` fora do repositório; `.env.example` com os nomes. A `SUPABASE_SERVICE_ROLE_KEY` e as chaves do Stripe **nunca** vão para o navegador (sem `NEXT_PUBLIC_`).
2. RLS ligado em todas as tabelas (já está no SQL). Qualquer tabela nova nasce com RLS e policies.
3. Valide toda entrada no servidor (Zod). Nunca confie em `plan` ou `user_id` vindos do cliente.
4. Webhook sempre com verificação de assinatura e idempotência.
5. URLs de vídeo assinadas, geradas no servidor após checar o plano.
6. LGPD: página de privacidade; WhatsApp opcional no cadastro, com aviso do uso; botão de excluir conta na `/conta` (fase 3 ou 4).
7. Texto das páginas: sem promessas de resultado; placeholders entre colchetes (`[...]`) ficam visíveis em desenvolvimento e **bloqueiam o deploy de produção** (adicione uma checagem simples que falhe o build se achar `[` seguido de MAIÚSCULAS em strings da UI).
8. Acessibilidade: foco visível, labels em todos os campos, alt em imagens.

## 9. Fases (pare ao fim de cada uma)

**Fase 0, base (meio dia).** Criar o projeto Next.js + Tailwind + TypeScript, ESLint/Prettier, Vitest, `.env.example`, estrutura de pastas, `docs/design/`. Conectar ao Supabase e aplicar `0001_init.sql`. Primeiro deploy vazio na Vercel.
*Pronto quando:* o site abre na URL da Vercel e as tabelas existem no Supabase com RLS ligado.

**Fase 1, Home, login e conta.** Layout e tokens, Home completa (com dados reais de `plans`, vagas do Intensivo e próxima live; puzzle do dia pode ser um registro de teste), `/entrar` (e-mail/senha, Google, confirmação por e-mail), `/planos` (sem checkout ainda), `/termos` e `/privacidade` (rascunho), proteção de rotas por sessão.
*Pronto quando:* consigo criar conta, entrar, sair, e a Home está fiel ao desenho no celular e no desktop.

**Fase 2, puzzles e Treino.** Script `scripts/import-lichess-puzzles.ts` (baixa o CSV do banco de puzzles do Lichess, licença CC0, filtra por popularidade e jogadas, importa entre 20 e 50 mil puzzles para caber no plano do Supabase). `/puzzle-do-dia`, `/puzzles`, `/painel` básico, `/treino` com conjuntos, ciclos, cronômetros, histórico, adicionar tática (FEN + solução) e revisão espaçada, com testes de unidade da lógica.
*Pronto quando:* completo dois ciclos de um conjunto de 20 puzzles, vejo o tempo comparado e os erros voltando na fila de revisão.

**Fase 3, pagamento e liberação.** Stripe completo (seção 7), controle de vagas e lista de espera, `/conta`, convite do WhatsApp liberado por plano, guarda de rotas por plano.
*Pronto quando:* em modo teste, a compra libera o plano sozinha, a falha de pagamento e o cancelamento retiram o acesso no prazo certo, e a 11ª pessoa não consegue comprar o Intensivo.

**Fase 4, aulas e admin.** `/aulas` com player (Bunny), progresso, arquivos; `/comunidade` e ranking; painel `/admin` (seção 5).
*Pronto quando:* publico uma aula com vídeo e PDF pelo admin, sem mexer em código, e um aluno do plano certo a assiste.

**Depois:** Stockfish para finais, gamificação (sequências, ranking mais completo), página do mestre convidado (a pedido), e-mails transacionais.

## 10. Variáveis de ambiente (`.env.example`)

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MEMBRO=
STRIPE_PRICE_INTENSIVO=
BUNNY_STREAM_LIBRARY_ID=
BUNNY_STREAM_API_KEY=
BUNNY_TOKEN_AUTH_KEY=
```

## 11. Pendências do Augusto (use placeholders até eu preencher)

- `[DIA E HORÁRIO DA LIVE]` (o TikTok já está definido: @augustochess)
- Texto final do FAQ "O que muda para quem entra agora como fundador?"
- Definir se o preço de lançamento é travado para os primeiros alunos
- Nome, foto e currículo do mestre convidado (não publicar nada dele antes de eu liberar)
- Domínio definitivo e e-mail de suporte
- Conta Stripe verificada para operar no Brasil

## 12. Como me responder

Antes de cada fase, diga em 5 linhas o que vai fazer e o que pode dar errado. Depois, entregue: o que mudou, como testar, o que ficou pendente. Se uma decisão minha for necessária, pergunte uma vez, de forma objetiva, com sua recomendação.
