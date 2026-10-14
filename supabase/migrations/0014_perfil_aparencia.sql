-- 0014: perfil editável (apelido, bio, foto, ranking) e preferências de aparência.
-- Parte "perfil" do PROMPT_PERSONALIZACAO_TITULOS.md (Bloco A). Rating e títulos
-- ficam para o Bloco B, usando o rating que já existe em user_stats.
-- Só acrescenta: nenhuma coluna ou dado existente é apagado.

create extension if not exists citext with schema extensions;

-- ============================================================
-- PERFIL
-- ============================================================
alter table public.profiles
  add column display_name extensions.citext,
  add column display_name_changed_at timestamptz,
  add column bio text,
  add column avatar_path text,
  add column show_in_ranking boolean not null default true,
  add column preferences jsonb not null default '{}'::jsonb;

alter table public.profiles
  add constraint profiles_display_name_format
    check (display_name is null or display_name::text ~ '^[A-Za-z0-9_.-]{3,20}$'),
  add constraint profiles_bio_len
    check (bio is null or char_length(bio) <= 160),
  add constraint profiles_prefs_size
    check (pg_column_size(preferences) <= 2048),
  add constraint profiles_avatar_own_folder
    check (avatar_path is null or avatar_path = id::text || '/avatar.webp');

-- citext: "Joao" e "joao" contam como o mesmo apelido.
create unique index profiles_display_name_key
  on public.profiles (display_name) where display_name is not null;

-- Apelido e foto só mudam pelo servidor (service role), que aplica as regras de
-- palavras proibidas, nomes reservados, prazo de 30 dias e processamento da foto.
-- Nome, WhatsApp, bio, ranking e preferências continuam editáveis pelo aluno
-- (a policy profiles_update já limita cada um à própria linha).
create or replace function public.profiles_protect_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') and (
       new.display_name is distinct from old.display_name
    or new.display_name_changed_at is distinct from old.display_name_changed_at
    or new.avatar_path is distinct from old.avatar_path
  ) then
    raise exception 'apelido e foto só podem ser alterados pelo servidor'
      using errcode = '42501';
  end if;
  return new;
end $$;

create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.profiles_protect_columns();

-- ============================================================
-- FOTOS (Supabase Storage)
-- Leitura pública; escrita só pelo servidor, que redimensiona para 256x256,
-- converte para webp e remove os metadados (EXIF/GPS) antes de gravar.
-- Por isso não há policy de escrita para alunos neste bucket.
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================
-- REGISTRO DE CONTAS EXCLUÍDAS
-- Guarda só o que foi apagado (sem e-mail ou nome), para auditoria.
-- ============================================================
create table public.account_deletions (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  deleted_at timestamptz not null default now(),
  summary jsonb not null default '{}'::jsonb
);
alter table public.account_deletions enable row level security;
create policy account_deletions_admin_select on public.account_deletions
  for select using ((select public.is_admin()));
-- Sem policy de escrita: só a service role grava.
