/*
# Revoke UPDATE on profiles.role from authenticated and anon

1. Security Changes
- Revoke UPDATE on the `role` column from `authenticated` and `anon` roles.
- This prevents users from elevating themselves to admin via the Data API.
- The `service_role` and `postgres` roles retain full access.
*/

REVOKE UPDATE (role) ON public.profiles FROM authenticated;
REVOKE UPDATE (role) ON public.profiles FROM anon;
