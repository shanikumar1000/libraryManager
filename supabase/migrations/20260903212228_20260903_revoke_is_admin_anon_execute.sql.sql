/*
# Revoke EXECUTE on is_admin() from anon

1. Security Changes
- Revoke EXECUTE on public.is_admin() from the anon role.
- The function is only called inside RLS policies (which run as authenticated),
  never directly via the REST API. Revoking EXECUTE from anon prevents
  unauthenticated callers from invoking it through /rest/v1/rpc/is_admin.
- The authenticated role retains EXECUTE, which is needed for RLS policy
  evaluation during authenticated requests.
*/

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
