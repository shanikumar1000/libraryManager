/*
# Lock down profiles.role column from client-side UPDATE

1. Security Changes
- Revoke table-level UPDATE from `authenticated` and `anon` on `profiles`.
- Re-grant UPDATE only on `full_name` and `updated_at` to `authenticated`.
- This ensures users cannot modify their own `role` column via the Data API,
  while still being able to update their display name.
- The RLS UPDATE policy already restricts rows to `auth.uid() = id`, so
  column-level privilege is the second layer of defense.
*/

REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM anon;

GRANT UPDATE (full_name, updated_at) ON public.profiles TO authenticated;
