-- Enable Row-Level Security on the bookmarks table.
--
-- Why: Supabase exposes an auto-generated PostgREST API at the project URL,
-- reachable by anyone with the public `anon` key. With RLS disabled, that API
-- grants full read/edit/delete on every row (Supabase advisor: rls_disabled_in_public).
--
-- This app NEVER uses PostgREST / @supabase/supabase-js — it connects directly
-- via postgres.js using DATABASE_URL (the transaction pooler / table-owner role),
-- which bypasses RLS by default. So enabling RLS with NO policies fully denies
-- anonymous PostgREST access while leaving the app's direct DB access untouched.
--
-- Do NOT add `FORCE ROW LEVEL SECURITY` here — that would also subject the owner
-- role to RLS and break every app query.

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
