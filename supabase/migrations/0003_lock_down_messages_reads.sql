-- The member chat was readable by anyone.
--
-- Migration 0001 let the anon role SELECT from the messages table, because the
-- members page read the chat directly from the browser using the public
-- Supabase key. That key ships inside the JavaScript bundle, so anyone who
-- opened the site could read every message and every member's email address
-- without signing in.
--
-- Chat reads now go through /api/messages, which requires a signed-in session
-- and queries with the service-role key. Nothing in the browser needs read
-- access any more, so it is removed.

begin;

revoke all on public.wmbc_messages from anon, authenticated, public;
grant  all on public.wmbc_messages to service_role;

drop policy if exists "messages_select_all" on public.wmbc_messages;

-- RLS stays enabled with no policies, so anon and authenticated get nothing.
-- service_role bypasses RLS, so the API route still works.

commit;
