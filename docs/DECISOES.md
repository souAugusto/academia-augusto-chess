# Decisões tomadas sem consulta

Formato: data · dúvida · escolha · motivo.

- 2026-10-13 · O prompt pede a análise "liberada para todos os usuários cadastrados" por padrão, mas o CLAUDE.md diz "Não existe plano gratuito". · A análise fica atrás de uma constante (`ANALYSIS_MIN_PLAN_RANK` em `src/lib/analysis/config.ts`) que começa em 1 (assinantes). A landing lê a constante e só fala em "gratuita" se ela for 0. · O CLAUDE.md lista isso como regra que nunca quebra; a constante deixa a troca a um commit de distância.
- 2026-10-13 · O prompt proíbe migrações destrutivas, mas o preview da Vercel usa o mesmo Supabase da produção. · Migrations novas são só aditivas (tabelas novas) e são aplicadas no banco para o preview funcionar. · O próprio prompt autoriza migrações aditivas; sem elas o preview quebra.
- 2026-10-13 · O nome `docs/PROMPT-MESTRE.md` é parecido com `PROMPT_MESTRE.md` (documento do produto). · Mantive os dois, com um aviso no topo do novo. · O prompt pede esse caminho exato; o documento do produto continua valendo para regras de negócio.
- 2026-10-13 · Como o motor confere as práticas. · `scripts/verificar-motor.ts` (Stockfish 19 lite no Node, local, sem custo), com 3 regras:
  - **Finais:** a posição declarada como "vencer" precisa dar ao melhor lance pelo menos 80% de chance; a "empatar", pelo menos 30%. Cada lance do aluno na solução precisa manter esse resultado e perder no máximo 8 pontos de chance para o melhor lance (ou manter um mate).
  - **Aberturas:** o lance pedido pode perder no máximo 10 pontos (aviso a partir de 6).
  - **Profundidade:** 20 nos finais e 15 nas aberturas.
  
  Motivo: comparar chance de vitória (curva do Lichess) evita falso alarme quando há vários lances ganhadores.
- 2026-10-13 · Pacote `stockfish` no projeto. · Entra como devDependency (19.0.1, exata), usado só nos scripts locais. Os arquivos servidos ao navegador continuam em `public/engine/`, copiados sem modificação. · Mantém o motor fora do bundle e permite repetir a verificação.

## Motor também confere linhas explicadas e armadilhas (2026-10-13)
O `verify:engine` passou a checar, além da prática: cada lance da linha principal e das variantes (profundidade 13; erro se perder mais de 15 pontos de chance, aviso acima de 9) e o fim de cada armadilha, que agora declara `favors` (brancas/pretas). O lado favorecido precisa ter ao menos 65% de chance (ou ter dado mate). Gambitos teóricos (ex.: Gambito do Rei) ficam abaixo do limite de erro.
