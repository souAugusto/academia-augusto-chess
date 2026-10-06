-- Academia Augusto Chess: dados do cadastro no perfil.
-- O formulário /entrar envia nome, WhatsApp (opcional) e o aceite dos termos como
-- metadados do signUp. O gatilho grava esses dados em public.profiles.
-- Os metadados vêm do cliente, então o gatilho limpa e limita tudo de novo.

alter table public.profiles
  add column if not exists terms_accepted_at timestamptz;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_whatsapp text := nullif(regexp_replace(coalesce(new.raw_user_meta_data->>'whatsapp', ''), '\D', '', 'g'), '');
begin
  insert into public.profiles (id, name, whatsapp, terms_accepted_at)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''), 80),
    case when length(v_whatsapp) between 10 and 13 then v_whatsapp end,
    case when new.raw_user_meta_data->>'terms_accepted' = 'true' then now() end
  );
  return new;
end $$;

-- create or replace mantém os privilégios, mas reforço o que a 0002 definiu.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
