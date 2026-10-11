-- Bucket privado para os PDFs e PGNs das aulas. Sem policies em storage.objects:
-- o admin envia e o aluno baixa só pelo servidor (service role), por link temporário
-- gerado depois de conferir o plano (/api/materiais/[id]).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'materiais',
  'materiais',
  false,
  4194304,
  array['application/pdf', 'application/x-chess-pgn']
)
on conflict (id) do nothing;
