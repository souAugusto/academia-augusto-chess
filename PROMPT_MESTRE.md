# Prompt mestre: Academia Finale de Xadrez

Você é o desenvolvedor sênior e designer de produto deste projeto. Leia este arquivo inteiro, depois o `CLAUDE.md` e as migrations em `supabase/migrations/`. Trabalhe em **fases** (seção 10). Ao fim de cada fase: lint, testes, build, deploy de preview, resumo, e **pare para eu validar** antes da próxima.

O dono do projeto é o Augusto (professor de xadrez; conhece Next.js, Vercel e Supabase, mas não é dev sênior de produto). Explique decisões em português, de forma direta.

> Histórico: o projeto começou como "Academia Augusto Chess". Em 2026-10-07 virou **Academia Finale de Xadrez**, reaproveitando repositório, Supabase, Vercel, login e banco já construídos.

---

## 1. Objetivo

Plataforma premium de treino de xadrez: **táticas, aberturas e finais**, com **aulas em vídeo**, para assinantes. Referência de acabamento: Linear, Stripe e Apple, não portais de jogos. Público brasileiro, majoritariamente no celular, vindo de redes sociais (Facebook, TikTok).

**Planos (somente pagos, decisão de 2026-10-07):**
- **Membro, R$ 19/mês:** táticas com rating e revisão de erros, aberturas, finais, aulas em vídeo (com PDF e PGN), lives exclusivas, ranking, torneios e grupo no WhatsApp.
- **Intensivo, R$ 119/mês, turma limitada a 10 alunos:** tudo do Membro, mais o método de treino por ciclos (`[NOME DO MÉTODO DO INTENSIVO]`), diagnóstico das partidas, plano de treino individual, revisões ao vivo na turma, grupo exclusivo da turma no WhatsApp, prioridade nas lives e 1 aula por mês com um mestre nacional em atividade (sem nome de mestre no site até eu liberar).

**Não existe plano gratuito.** Sem assinatura ativa, a conta existe mas só acessa Home, planos, páginas institucionais e o **puzzle do dia** (única parte pública jogável).

Não prometa resultado (ex.: "suba X pontos de rating") em nenhum texto.

## 2. Stack (não troque sem me avisar)

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4. No Next 16, `middleware.ts` virou `src/proxy.ts`.
- Supabase: Auth (e-mail/senha + Google), Postgres, RLS, Storage. Use `@supabase/ssr`.
- Tabuleiro: **`react-chessboard` (MIT) + `chess.js` (BSD)**, com as peças Cburnett (licença BSD, `public/pieces/cburnett/`). O `chessground` foi descartado por ser GPL-3.0 (decisão de 2026-10-07).
- Motor: **Stockfish (WASM) isolado num Web Worker**, servido como arquivo próprio em `public/engine/`, comunicando-se só por mensagens UCI. Publicar o aviso da licença GPL do Stockfish e o link para o código-fonte dele em `/creditos`.
- Animação: Framer Motion, sempre respeitando `prefers-reduced-motion`.
- Vídeo: **YouTube não listado** no começo, atrás de uma interface própria (`src/lib/video/`) para trocar de provedor depois (Bunny Stream/Mux) sem refazer telas. YouTube não protege o conteúdo: quem tiver o link assiste.
- Pagamento: provedor **a definir na Fase 4** (Pix + cartão recorrentes), atrás de `src/lib/payments/`. Consultar a documentação oficial antes de implementar Pix recorrente.
- Deploy: Vercel (GitHub, deploy automático). Testes: Vitest para a lógica pura.
- Fuso padrão para "dia" (puzzle do dia, sequência diária): `America/Sao_Paulo`.

## 3. Identidade de marca

- **Nome:** Academia Finale de Xadrez. Nome curto na interface: **Finale**.
- **Tom de voz:** português do Brasil, direto, elegante e motivador, sem gírias excessivas.
- **Logo:** monograma "F" com referência a uma peça (cavalo), versão horizontal e ícone quadrado; favicon, ícones do PWA e imagem Open Graph.
- **Paleta "Midnight Gold"** (tokens únicos no tema do Tailwind; modo escuro padrão, modo claro opcional, contraste AA no mínimo):

| Token | Escuro |
|---|---|
| fundo (`bg`) | `#0B0D12` |
| superfície (`surface`) | `#141821` |
| superfície 2 (`surface-2`) | `#1B2030` |
| borda | `rgba(255,255,255,0.08)` |
| texto | `#EDEFF5` |
| texto secundário | `#9AA3B8` |
| destaque (`accent`, dourado) | `#E8B84A` |
| destaque 2 (`accent-2`, azul violeta) | `#6C7AE0` |
| sucesso | `#3DDC97` |
| perigo | `#FF5C6C` |
| tabuleiro claro / escuro (tema padrão) | `#3B4466` / `#2A3045` |

- **Tipografia:** Inter (interface) e Fraunces (títulos de destaque), via `next/font`.
- **Estilo:** vidro fosco discreto, sombras suaves, bordas sutis, gradientes leves com dourado. Luxo é espaço e hierarquia, não excesso de efeito.
- **Regras:** áreas de toque de no mínimo 44px; responsivo de 360px a telas grandes; navegação inferior no celular; `<button>`, `<a>`, `<label>` semânticos; foco visível; ícones só em SVG; sem emojis.

## 4. Planos e regras de acesso

- `plans.rank`: Membro = 1, Intensivo = 2. Intensivo inclui tudo do Membro.
- Acesso decidido no **servidor** e reforçado pelo RLS. Esconder botão não é proteção.
- Status com acesso: `active`, `trialing`, `past_due` (tolerância de 3 dias após `current_period_end`).
- Concessão manual pelo admin: linha em `subscriptions` com `source = 'manual'`.
- Vagas do Intensivo: `intensivo_seats_left()` e `reserve_intensivo_seat()` (já no banco). Com 0 vagas, botão "Entrar na lista de espera" (`waitlist`).
- Links dos grupos de WhatsApp em `app_settings`, entregues só no servidor a quem tem o plano.

## 5. Páginas

**Públicas:** Home (`/`: proposta de valor, demonstração do tabuleiro, módulos, planos, dúvidas), `/puzzle-do-dia`, `/planos`, `/entrar` (Entrar e Criar conta em abas; WhatsApp opcional com aviso de uso; aceite dos termos; Google), `/recuperar-senha`, `/sobre`, `/contato`, `/termos`, `/privacidade`, `/creditos`.

**App (logado, com plano):** `/painel` (rating, sequência, revisão de hoje, próxima lição, trilhas), `/taticas`, `/aberturas` e `/aberturas/[repertorio]`, `/finais` e `/finais/[posicao]`, `/aulas` e `/aulas/[curso]/[aula]`, `/treino` (Intensivo), `/conta`, `/checkout`.

**Admin (`/admin`, só quem está em `admins`):** cursos, módulos, aulas (vídeo e arquivos), puzzles e puzzle do dia, repertórios, finais, alunos e assinaturas, concessão manual, configurações, vagas do Intensivo. Tudo sem mexer em código.

## 6. Módulos

**Táticas:** tabuleiro com feedback imediato (acerto, erro, dica, mostrar solução); filtro por tema (garfo, cravada, ataque duplo, mate em N, desvio, raio-X…) e dificuldade; rating do aluno (Elo simplificado); sequência diária; revisão de erros com repetição espaçada (regras abaixo). Base: banco aberto do Lichess (CC0), importado por `scripts/import-lichess-puzzles.ts`. No Lichess, `moves[0]` é o lance do adversário aplicado automaticamente; o aluno joga a partir de `moves[1]`; qualquer lance que dê mate também vale.

**Revisão espaçada (variação do SM-2, função pura testada):**
- Erro: `repetitions = 0`, `interval_days = 0`, `lapses += 1`, `ease = max(1.3, ease - 0.2)`, `due_at = agora + 10 min`.
- Acerto: `repetitions += 1`; `interval_days` = 1 (1ª), 3 (2ª), senão `round(interval_days * ease)`; `due_at = agora + interval_days`.
- Acerto muito mais rápido que a mediana do aluno naquele puzzle: `ease += 0.05`.

**Aberturas:** repertórios em árvore de variantes, com comentário em português em cada lance. Modo treino: o app joga o adversário e o aluno precisa acertar a linha, com explicação. Nomes e códigos ECO do repositório aberto `lichess-org/chess-openings` (CC0).

**Finais:** biblioteca de posições clássicas (Lucena, Philidor, rei e peão, torres…) por nível. Treino contra o Stockfish: converter ou segurar a posição, com avaliação dos lances.

**Aulas em vídeo:** cursos, módulos e aulas, com progresso (concluída, continuar de onde parou), materiais em PDF e PGN, e **tabuleiro sincronizado com o vídeo** (marcações de tempo ligadas a lances do PGN).

**Método do Intensivo (`/treino`):** conjuntos de táticas (oficiais ou do aluno), ciclos de repetição com cronômetro (ciclo N sem total, tempo do puzzle, do ciclo atual e do anterior, histórico); lance errado mostra a solução e segue. Sem número fixo de ciclos nem prazo.

## 7. Pagamentos (Fase 4)

- Pix e cartão recorrentes; provedor a escolher comigo (Stripe, Mercado Pago ou Asaas), atrás de `src/lib/payments/`.
- Checkout exige login; no Intensivo, reservar vaga antes de abrir o pagamento.
- Webhook: validar assinatura com o corpo bruto, idempotência (tabela de eventos), upsert em `subscriptions`. Tudo com a service role, só no servidor.
- Cancelamento: acesso até o fim do período pago. Não ligar modo real sem minha confirmação.

## 8. Segurança e qualidade (inegociável)

1. Nenhuma chave no código nem no Git; `.env.example` com os nomes. Segredos nunca com `NEXT_PUBLIC_`.
2. RLS em todas as tabelas; mudanças de banco só por migration numerada.
3. Toda entrada validada no servidor (Zod). Nunca confiar em `plan` ou `user_id` vindos do cliente.
4. Vídeo premium: quando sair do YouTube, URLs assinadas geradas no servidor após checar o plano.
5. LGPD: privacidade, WhatsApp opcional com aviso, exclusão de conta na `/conta`.
6. Placeholders `[MAIÚSCULAS]` aparecem no preview e **bloqueiam o build de produção** (`scripts/check-placeholders.ts`).
7. Licenças: só conteúdo aberto (Lichess CC0, `chess-openings` CC0) ou do Augusto. Nada copiado de livros ou cursos de terceiros.
8. Acessibilidade: foco visível, teclado, labels, aria, contraste AA.
9. Performance e SEO: Core Web Vitals, metadados, Open Graph, `sitemap`, `robots.txt`. PWA instalável.

## 9. O que já existe (reaproveitado)

Login completo (e-mail, confirmação, recuperar senha; Google pendente de credencial), proteção de rotas por sessão, migrations 0001 a 0003 (planos, assinaturas, vagas, puzzles, tentativas, revisão, conjuntos e ciclos, cursos, aulas, lives, configurações; perfil com WhatsApp e aceite dos termos), lógica pura testada em `src/lib/`, peças Cburnett.

## 10. Fases (pare ao fim de cada uma)

1. **Fundação:** marca Finale (logo, favicon, OG), design system Midnight Gold com tema claro/escuro, layout (cabeçalho no desktop, navegação inferior no celular), PWA, troca de marca nas telas existentes.
2. **MVP:** tabuleiro, táticas com feedback e rating, puzzle do dia jogável, importação do Lichess, área de aulas com vídeo (YouTube).
3. **Aberturas e finais:** repertórios e modo treino, biblioteca de finais, Stockfish no Worker.
4. **Monetização:** planos, pagamento (Pix + cartão), vagas e lista de espera, controle de acesso, painel admin.
5. **Retenção:** dashboard, sequência diária, revisão espaçada, trilhas, vídeo sincronizado, método do Intensivo, polimento de animações.

## 11. Variáveis de ambiente (`.env.example`)

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
(pagamento e vídeo: nomes definidos nas fases 2 e 4)
```

## 12. Pendências do Augusto (placeholders até preencher)

- `[NOME DO MÉTODO DO INTENSIVO]`
- Dia e horário das lives; benefício de fundador; duração e estrutura do método
- Aberturas e finais entram no Membro? (assumido: sim, até ele confirmar)
- Provedor de pagamento (Fase 4); domínio definitivo e e-mail de suporte; SMTP próprio
- Razão social, CNPJ e foro (termos e privacidade)
- Credencial do Google (OAuth) no Supabase

## 13. Como me responder

Antes de cada fase, diga em 5 linhas o que vai fazer e o que pode dar errado. Depois: o que mudou, como testar, o que ficou pendente. Decisão minha necessária: pergunte uma vez, objetiva, com sua recomendação.
