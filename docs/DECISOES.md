# Decisões tomadas sem consulta

Formato: data · dúvida · escolha · motivo.

- 2026-10-13 · O prompt pede a análise "liberada para todos os usuários cadastrados" por padrão, mas o CLAUDE.md diz "Não existe plano gratuito". · A análise fica atrás de uma constante (`ANALYSIS_MIN_PLAN_RANK` em `src/lib/analysis/config.ts`) que começa em 1 (assinantes). A landing lê a constante e só fala em "gratuita" se ela for 0. · O CLAUDE.md lista isso como regra que nunca quebra; a constante deixa a troca a um commit de distância.
- 2026-10-13 · O prompt proíbe migrações destrutivas, mas o preview da Vercel usa o mesmo Supabase da produção. · Migrations novas são só aditivas (tabelas novas) e são aplicadas no banco para o preview funcionar. · O próprio prompt autoriza migrações aditivas; sem elas o preview quebra.
- 2026-10-13 · O nome `docs/PROMPT-MESTRE.md` é parecido com `PROMPT_MESTRE.md` (documento do produto). · Mantive os dois, com um aviso no topo do novo. · O prompt pede esse caminho exato; o documento do produto continua valendo para regras de negócio.
