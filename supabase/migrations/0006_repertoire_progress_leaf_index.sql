-- Índice para a chave estrangeira leaf_id (aviso do advisor de performance).
create index if not exists repertoire_progress_leaf_idx
  on public.repertoire_progress (leaf_id);
