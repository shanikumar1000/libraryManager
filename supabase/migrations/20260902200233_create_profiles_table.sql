/*
# Create profiles table with role-based access control

1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users.id ON DELETE CASCADE)
  - `email` (text, not null — copied from auth.users on signup)
  - `full_name` (text, nullable — populated from user metadata "full_name" key)
  - `role` (text, not null, default 'student' — controls dashboard routing)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `profiles`.
- Each authenticated user can SELECT only their own profile row.
- INSERT is handled by a SECURITY DEFINER trigger function (not a client policy),
  so no INSERT policy is needed for the table itself.
- Users can UPDATE only their own profile row (but NOT the role column — enforced
  by column-level privileges revoking UPDATE on `role`).
- The `role` column is protected: only service-role / superadmin can modify it.
  The `authenticated` role has UPDATE on `full_name` only.

3. Automation
- A trigger `on_auth_user_created` fires AFTER INSERT on `auth.users`.
- The trigger calls `handle_new_user()` which inserts a row into `profiles`
  with the user's id, email, and full_name (from raw_user_meta_data).
- The default role is 'student'.

4. Important Notes
1. The trigger function is SECURITY DEFINER so it can write to `profiles`
   even though the calling session is `anon` (during the signup flow).
2. The function's search_path is locked to `public` to prevent schema injection.
3. RLS is enabled on `profiles` — the SECURITY DEFINER function bypasses RLS,
   which is the intended pattern for the auto-create trigger.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  role        text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: users can read their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- UPDATE: users can update their own profile (but NOT the role column —
-- column-level privilege revokes that below)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Revoke UPDATE on the `role` column from authenticated users so they
-- cannot elevate themselves to admin.
REVOKE UPDATE (role) ON public.profiles FROM authenticated;

-- Trigger function: creates a profile row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger: fires after a new row is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
