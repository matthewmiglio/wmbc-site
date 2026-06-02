-- Security fix: lock down public.SIGNUPs and public.messages.
-- Scope is intentionally narrow: only the two tables this app's routes touch.
-- Other tables in this Supabase project are unrelated and untouched.

begin;

-- ============================================================
-- public."SIGNUPs"
-- Access pattern: server-only via /api/addToSignUpTable and
-- /api/emailExistsInSignups, both using the service-role key.
-- Therefore anon and authenticated must have ZERO access.
-- ============================================================

alter table public."SIGNUPs" enable row level security;
alter table public."SIGNUPs" force row level security;

revoke all on public."SIGNUPs" from anon, authenticated, public;
grant  all on public."SIGNUPs" to service_role;

-- Drop any prior policies on this table (none expected, defensive).
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname='public' and tablename='SIGNUPs'
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, 'SIGNUPs');
  end loop;
end $$;

-- With RLS enabled and no policies, anon/authenticated get nothing.
-- service_role bypasses RLS, so the API routes still work.


-- ============================================================
-- public.messages
-- Access pattern:
--   - reads (SELECT + realtime) happen from the browser via the anon key
--   - writes (INSERT) now go through /api/postMessage which checks the
--     NextAuth session and inserts via the service-role key
-- Therefore anon may SELECT, but must not INSERT/UPDATE/DELETE.
-- ============================================================

alter table public.messages enable row level security;
alter table public.messages force row level security;

revoke all on public.messages from anon, authenticated, public;
grant  select on public.messages to anon, authenticated;
grant  all    on public.messages to service_role;

do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname='public' and tablename='messages'
  loop
    execute format('drop policy if exists %I on public.messages', p.policyname);
  end loop;
end $$;

create policy "messages_select_all"
  on public.messages
  for select
  to anon, authenticated
  using (true);

-- No INSERT/UPDATE/DELETE policies => those operations are blocked for
-- anon/authenticated even if grants are later mistakenly restored.

commit;
