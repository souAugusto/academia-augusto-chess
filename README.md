# Academia Finale de Xadrez

Site de assinatura de xadrez. Especificação completa em `PROMPT_MESTRE.md`; regras de trabalho em `CLAUDE.md`.

## Rodar localmente

1. Node 24 (`node -v`).
2. `npm ci`
3. Copie `.env.example` para `.env.local` e preencha (URL e chave pública do Supabase bastam para a Fase 0).
4. `npm run dev` e abra http://localhost:3000

## Comandos

| Comando             | O que faz                                                 |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | servidor local                                            |
| `npm run lint`      | ESLint                                                    |
| `npm run typecheck` | checagem de tipos                                         |
| `npm run test`      | testes (Vitest)                                           |
| `npm run format`    | formata com Prettier                                      |
| `npm run build`     | build de produção (roda antes a checagem de placeholders) |

## Pastas

- `src/app/`: rotas (App Router)
- `src/components/`: componentes de interface
- `src/lib/`: lógica pura (com testes `*.test.ts`) e clientes do Supabase (`src/lib/supabase/`)
- `src/proxy.ts`: renova a sessão do Supabase a cada requisição
- `scripts/`: scripts de linha de comando
- `supabase/migrations/`: migrations numeradas do banco
- `docs/design/`: desenhos de referência

## Placeholders

Textos pendentes ficam entre colchetes em maiúsculas, ex.: `[DIA E HORÁRIO DA LIVE]`.
Eles aparecem em desenvolvimento e nos previews, mas **bloqueiam o build de produção** na Vercel
(`scripts/check-placeholders.ts`).
