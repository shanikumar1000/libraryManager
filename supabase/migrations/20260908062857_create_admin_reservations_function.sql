/*
# Create get_admin_reservations() function

1. New Function
- `get_admin_reservations()` — SECURITY DEFINER function that returns all
  reservations joined with their related book and user profile data.
- Returns one row per reservation with: reservation id, book_id, book title,
  book author, book cover_color, user_id, user full_name, user email,
  reserved_date, due_date, status.
- Guards with `is_admin()` — non-admins get an empty result set.

2. Why a SECURITY DEFINER function
- The `profiles` table RLS policy (`profiles_select_own`) only lets users
  read their own profile row. An admin doing a client-side join
  `reservations → profiles` would only see their own profile data, not
  other users' names/emails.
- A SECURITY DEFINER function bypasses RLS, but the `is_admin()` guard
  ensures only admins can call it and receive data.

3. Security
- `SECURITY DEFINER` with `search_path` locked to `public`.
- EXECUTE granted to `authenticated` only.
- Non-admins receive an empty array, not an error — the function body
  short-circuits via `is_admin()`.

4. Important Notes
1. No table changes — this is a read-only function over existing tables.
2. Uses only existing column names from `reservations`, `books`, `profiles`.
3. No frontend changes in this migration.
*/

CREATE OR REPLACE FUNCTION public.get_admin_reservations()
RETURNS TABLE (
  id uuid,
  book_id uuid,
  book_title text,
  book_author text,
  book_cover_color text,
  user_id uuid,
  user_name text,
  user_email text,
  reserved_date date,
  due_date date,
  status text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    r.id,
    r.book_id,
    b.title   AS book_title,
    b.author  AS book_author,
    b.cover_color AS book_cover_color,
    r.user_id,
    COALESCE(p.full_name, p.email) AS user_name,
    p.email   AS user_email,
    r.reserved_date,
    r.due_date,
    r.status
  FROM public.reservations r
  JOIN public.books b   ON b.id = r.book_id
  LEFT JOIN public.profiles p ON p.id = r.user_id
  WHERE public.is_admin()
  ORDER BY r.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_reservations() TO authenticated;
