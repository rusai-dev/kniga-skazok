-- Run once on a dedicated Supabase project, ONLY after owner authorizes provisioning.
-- All stories are encrypted in the browser. The database stores ciphertext only.
-- Provision a row as administrator: read_id is SHA-256("skazki-cloud-read-v1:"+reader secret)
-- writer_digest is SHA-256 of a separate random 32-byte writer capability, represented as hex text.
create schema if not exists storybook_private;
revoke all on schema storybook_private from public, anon, authenticated;
create table if not exists storybook_private.family_archive (
  read_id text primary key check (read_id ~ '^[a-f0-9]{64}$'),
  writer_digest text not null check (writer_digest ~ '^[a-f0-9]{64}$'),
  revision bigint not null default 0,
  envelope jsonb,
  updated_at timestamptz not null default now(),
  check (envelope is null or octet_length(envelope::text) <= 9000000)
);
alter table storybook_private.family_archive enable row level security;
revoke all on storybook_private.family_archive from public, anon, authenticated;
create or replace function public.storybook_read_v1(p_read_id text)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select pg_catalog.jsonb_build_object('revision', revision, 'envelope', envelope)
  from storybook_private.family_archive
  where read_id = p_read_id and p_read_id ~ '^[a-f0-9]{64}$';
$$;
create or replace function public.storybook_write_v1(p_read_id text, p_writer text, p_revision bigint, p_envelope jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare next_revision bigint;
begin
  if p_read_id is null or p_read_id !~ '^[a-f0-9]{64}$' or
     p_writer is null or p_writer !~ '^[a-f0-9]{64}$' or
     p_revision is null or p_revision < 0 or
     p_envelope is null or pg_catalog.jsonb_typeof(p_envelope) <> 'object' or
     pg_catalog.octet_length(p_envelope::text) > 9000000 or
     coalesce(p_envelope->>'iv','') !~ '^[a-f0-9]{24}$' or
     coalesce(p_envelope->>'cipher','') !~ '^[A-Za-z0-9+/]+={0,2}$' then
    return pg_catalog.jsonb_build_object('ok',false);
  end if;
  update storybook_private.family_archive
  set revision = revision + 1, envelope = p_envelope, updated_at = pg_catalog.now()
  where read_id = p_read_id and revision = p_revision
    and writer_digest = pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_writer,'UTF8')),'hex')
  returning revision into next_revision;
  if next_revision is null then
    return pg_catalog.jsonb_build_object('ok',false);
  end if;
  return pg_catalog.jsonb_build_object('ok',true,'revision',next_revision);
end;
$$;
revoke all on function public.storybook_read_v1(text) from public, anon, authenticated;
revoke all on function public.storybook_write_v1(text,text,bigint,jsonb) from public, anon, authenticated;
grant execute on function public.storybook_read_v1(text) to anon, authenticated;
grant execute on function public.storybook_write_v1(text,text,bigint,jsonb) to anon, authenticated;
-- No row, key or family content is committed to this public repo.
