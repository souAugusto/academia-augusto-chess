# Checklist da rodada autônoma (fonte da verdade do andamento)

Prompt: `docs/PROMPT-MESTRE.md`. Branch: `feat/licoes-analise-landing`.
Marque `[x]` ao concluir e faça commit na hora ("checkpoint: <item>").

## 0. Preparação
- [x] Salvar o prompt em docs/PROMPT-MESTRE.md
- [x] Criar CHECKLIST, PROGRESSO, DECISOES e PENDENCIAS
- [x] Reconhecimento do repositório (registrado em PROGRESSO.md)

## 1. Infraestrutura das lições
- [x] Tipos do conteúdo (aberturas e finais) em src/content/licoes
- [x] Validação pura (chess.js) em src/lib/lessons/validate.ts com testes
- [x] Script scripts/validar-conteudo.ts ligado ao prebuild e ao npm test
- [x] Script offline scripts/verificar-motor.ts (Stockfish via npm, local)
- [x] Migration aditiva 0011: progresso de estudo por lição
- [x] Páginas /licoes, /licoes/aberturas, /licoes/finais e /licoes/[slug]
- [x] Componente da lição: introdução, passo a passo, armadilhas
- [x] Prática interativa por níveis (fácil, médio, difícil) com dica e explicação
- [x] Mini-quiz com correção
- [x] Progresso salvo e selo de lição concluída
- [x] Ligações a partir de /aberturas e /finais

## 2. Lições de aberturas (uma por item)
### Com brancas
- [x] Italiana: Giuoco Piano
- [x] Italiana: Giuoco Pianissimo
- [x] Espanhola: Defesa Berlim
- [x] Espanhola: Fechada
- [x] Espanhola: Aberta
- [x] Escocesa
- [x] Gambito da Dama Aceito
- [x] Gambito da Dama Recusado
- [x] Inglesa
- [x] Sistema Londres
- [x] Catalã
- [x] Gambito do Rei (visão geral)
### Com pretas
- [x] Siciliana Najdorf
- [x] Siciliana Dragão
- [x] Siciliana Scheveningen
- [x] Siciliana Clássica
- [x] Siciliana Fechada
- [x] Francesa: Avanço
- [x] Francesa: Troca
- [x] Francesa: Tarrasch
- [x] Caro-Kann: Clássica
- [x] Caro-Kann: Avanço
- [x] Escandinava
- [x] Defesa Eslava
- [x] Semi-Eslava
- [x] Nimzo-Índia
- [x] Índia do Rei
- [x] Índia da Dama
- [x] Grünfeld
- [x] Petroff
- [x] Defesa Philidor
- [x] Defesa Holandesa

## 3. Lições de finais (uma por tópico, 5 a 10 posições cada)
### Mates básicos
- [x] Rei e dama contra rei
- [x] Rei e torre contra rei
- [x] Mate com duas torres
- [x] Mate com dois bispos
- [x] Mate com bispo e cavalo (técnica)
### Finais de peões
- [x] Oposição direta
- [x] Oposição distante
- [x] Oposição diagonal
- [x] Regra do quadrado
- [ ] Peão de torre
- [x] Peão central e casas-chave
- [x] Regra de Réti
- [ ] Triangulação
- [ ] Zugzwang
- [ ] Peões ligados e passados
- [x] Brecha (peão de rompimento)
### Finais de torre
- [x] Posição de Lucena
- [x] Posição de Philidor
- [x] Torre atrás do peão passado
- [x] Rei cortado
- [x] Torre e peão de torre
- [ ] Torre ativa contra torre passiva
- [ ] 4 contra 3 e 3 contra 2 na mesma ala
### Finais de bispos
- [ ] Bispos da mesma cor
- [ ] Bispos de cores opostas
- [ ] Bispo bom contra bispo mau
- [ ] Bispo contra cavalo
### Finais de cavalos
- [ ] Finais de cavalo
- [ ] Cavalo contra bispo
### Finais de dama
- [x] Dama contra peão na 7ª fileira
- [x] Dama contra torre
- [ ] Xeque perpétuo
### Finais combinados
- [ ] Torre e peça menor
- [ ] Conversão de vantagem material
- [ ] Como empatar: fortalezas e afogamento

## 4. Análise de partidas
- [x] Lógica pura: chance de vitória, classificação, precisão, momentos críticos (com testes)
- [x] Cliente do motor com profundidade e multipv, cancelamento
- [x] Cache longo dos arquivos do motor
- [x] Cloud eval do Lichess nas primeiras jogadas, com fallback
- [x] Entrada: colar PGN (validação) e escolher partida importada (busca do PGN)
- [x] Reaproveitar avaliações do Lichess quando existirem
- [x] Migration aditiva 0012: análises salvas (JSON compacto, RLS)
- [x] Tela: tabuleiro, navegação por teclado, barra de avaliação, seta do melhor lance
- [x] Lista de lances com ícones de classificação
- [x] Gráfico de avaliação clicável
- [x] Resumo: precisão, contagens e 3 momentos críticos
- [x] Modo "Tente de novo"
- [x] Limite por plano configurável (constante) com mensagem de upgrade
- [x] "Analisar esta partida" nas partidas importadas
- [x] Sugestões de lições a partir da análise

## 5. Licenças
- [x] /public/licencas com o LICENSE do pacote do motor
- [x] /creditos com versão exata, código-fonte e aviso de software livre
- [x] THIRD_PARTY_LICENSES gerado com license-checker
- [x] Lista de licenças permitidas, falhando o build no inesperado
- [x] Cláusula de componentes de terceiros nos Termos de Uso
- [x] Pendências jurídicas e de hospedagem em PENDENCIAS.md

## 6. Landing page
- [ ] Seção do problema (estudar sem direção)
- [ ] Seção do teste de estilo com preview do resultado
- [ ] Seção de importação de partidas com mockup
- [ ] Seção de análise com motor (gratuidade lida da constante)
- [ ] Seção "estilo + dados + análise = treino sob medida"
- [ ] Seções de lições de aberturas e finais com contagem real
- [ ] SEO: metadados, Open Graph e dados estruturados

## 7. Melhoria contínua
- [ ] Ciclo 1
- [ ] Ciclo 2
- [ ] Ciclo 3

## 8. Entrega
- [ ] PROGRESSO.md final e resumo
