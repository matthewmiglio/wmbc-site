-- Namespacing: this Supabase project is shared with other apps.
-- Prefix this app's tables with wmbc_ so they are unambiguous.
-- RENAME preserves the table OID, so RLS, policies, grants, indexes,
-- constraints, and publication membership from 0001 all carry over
-- automatically. Only name-based references in app code changed.

begin;

alter table public."SIGNUPs" rename to "wmbc_SIGNUPs";
alter table public.messages   rename to wmbc_messages;

commit;
