-- 0017: "Minha conta" reorganizada.
-- - Foto com nome único por envio ({user_id}/avatar-<hora>.webp): o navegador
--   nunca mostra a foto antiga do cache e a anterior é apagada ao trocar.
--   A regra continua: o arquivo precisa estar na pasta do próprio usuário.
-- - Campos opcionais do perfil: cidade/país e rating declarado.
-- Só acrescenta ou afrouxa uma regra; nenhum dado é apagado.

alter table public.profiles drop constraint if exists profiles_avatar_own_folder;
alter table public.profiles
  add constraint profiles_avatar_own_folder
    check (
      avatar_path is null
      or avatar_path ~ ('^' || id::text || '/avatar(-[0-9]+)?\.webp$')
    );

alter table public.profiles
  add column location text,
  add column declared_rating int;

alter table public.profiles
  add constraint profiles_location_len
    check (location is null or char_length(location) between 2 and 80),
  add constraint profiles_declared_rating_range
    check (declared_rating is null or declared_rating between 100 and 3500);
