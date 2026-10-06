# Desenhos de referência: Academia Augusto Chess

Três telas desenhadas como protótipo. São a **referência visual e de texto**; o site real é feito em Next.js + Tailwind (ver `PROMPT_MESTRE.md`).

| Arquivo | Tela | Rota no site |
|---|---|---|
| `home.dc.html` | Home (página de vendas) | `/` |
| `entrar.dc.html` | Entrar / Criar conta (duas abas) | `/entrar` |
| `treino.dc.html` | Treino por ciclos, Método Augusto Chess (Intensivo) | `/treino` (Fase 2) |

## Como ler estes arquivos

São HTML de um protótipo, **não** código para copiar. Eles usam marcações próprias que você deve ignorar ou traduzir:

- `<x-dc>`, `<helmet>`, `<sc-for>`, `<sc-if>`, `{{variavel}}`, `onClick="{{...}}"` e o `<script type="text/x-dc">` no fim: são do editor do protótipo.
- `<script src="./support.js">` não existe aqui e não deve ser usado.

O que vale aproveitar:
- **Layout, espaçamentos, tamanhos e hierarquia** (estilos inline).
- **Cores e fontes** (tokens também listados no `PROMPT_MESTRE.md`, seção 3).
- **Textos**: use exatamente os da Home. O que está entre colchetes é pendência do Augusto (ex.: `[DIA E HORÁRIO DA LIVE]`) e deve aparecer como placeholder até ele preencher.
- **Comportamento**: em `entrar`, as abas Entrar/Criar conta alternam o formulário sem mudar de página.

## Pontos importantes

- O tabuleiro nos desenhos é só ilustração (gerado por um pequeno script a partir de um FEN). No site real, use `chessground` + `chess.js`.
- Os dados da tela de Treino (tempos, acertos, "5 puzzles com erro") são **exemplos**.
- O plano **Intensivo** mostra "Turma de 10 alunos"; no site real, o contador "Restam X de 10 vagas" vem do banco (`intensivo_seats_left()`).
- Não existe plano gratuito.
- Fidelidade mobile: os desenhos são fluidos e usam quebra de linha (flex-wrap). Garanta boa leitura em 390px de largura.
