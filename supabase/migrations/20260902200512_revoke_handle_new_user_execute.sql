/*
# Revoke EXECUTE on handle_new_user from anon and authenticated

1. Security Changes
- Revoke EXECUTE on `public.handle_new_user()` from `anon` and `authenticated`.
- This function is only called by the `on_auth_user_created` trigger, never
  directly via the REST API. Revoking EXECUTE prevents callers from invoking
  it through `/rest/v1/rpc/handle_new_user`.
- The trigger itself runs with the function's SECURITY DEFINER privileges
  regardless of the caller's EXECUTE grant, so the trigger still works.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
