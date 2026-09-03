/*
# Create reservations table with owner-scoped + admin RLS

1. New Table
- `reservations` — tracks each user's book reservation lifecycle.

2. reservations Table Columns
- `id` (uuid, primary key, defaults to gen_random_uuid())
- `book_id` (uuid, NOT NULL, references books(id) ON DELETE CASCADE)
- `user_id` (uuid, NOT NULL, DEFAULT auth.uid(), references profiles(id)
  ON DELETE CASCADE)
- `reserved_date` (date, NOT NULL DEFAULT CURRENT_DATE)
- `due_date` (date, NOT NULL, CHECK due_date >= reserved_date)
- `status` (text, NOT NULL DEFAULT 'pending', constrained to pending,
  approved, issued, returned, rejected, cancelled)
- `created_at` (timestamptz, NOT NULL DEFAULT now())
- `updated_at` (timestamptz, NOT NULL DEFAULT now())

3. Indexes
- `idx_reservations_user_id` on `user_id` (student dashboard queries)
- `idx_reservations_book_id` on `book_id` (join lookups)
- `idx_reservations_status` on `status` (admin filtering)
- `idx_reservations_due_date` on `due_date` (overdue checks)

4. Automation
- `update_reservations_updated_at()` trigger to keep `updated_at` current.

5. Security — RLS policies (4 per table, no FOR ALL)
- SELECT: users can read their own reservations; admins can read all.
- INSERT: authenticated users can create reservations only for themselves
  (WITH CHECK auth.uid() = user_id). The DEFAULT auth.uid() on user_id
  ensures inserts that omit user_id still pass the check.
- UPDATE: only admins can update reservation status (USING + WITH CHECK
  via is_admin()). Students cannot modify any reservation.
- DELETE: only admins can delete reservations.

6. Important Notes
1. Reuses the existing is_admin() function created in the books migration.
2. No separate students table — profiles is the user identity source.
3. user_id defaults to auth.uid() so client inserts that omit user_id
   still satisfy the INSERT WITH CHECK.
4. No frontend changes in this migration.
*/

CREATE TABLE IF NOT EXISTS public.reservations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id       uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  reserved_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date      date NOT NULL,
  status        text NOT NULL DEFAULT 'pending' CHECK (
                  status IN ('pending','approved','issued','returned','rejected','cancelled')
                ),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reservations_due_after_reserved CHECK (due_date >= reserved_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations (user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_book_id ON public.reservations (book_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations (status);
CREATE INDEX IF NOT EXISTS idx_reservations_due_date ON public.reservations (due_date);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_reservations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reservations_updated_at ON public.reservations;
CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reservations_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- SELECT: users see their own reservations; admins see all
DROP POLICY IF EXISTS "reservations_select_own_or_admin" ON public.reservations;
CREATE POLICY "reservations_select_own_or_admin"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- INSERT: authenticated users can create reservations only for themselves
DROP POLICY IF EXISTS "reservations_insert_own" ON public.reservations;
CREATE POLICY "reservations_insert_own"
  ON public.reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: only admins can update reservation status
DROP POLICY IF EXISTS "reservations_update_admin" ON public.reservations;
CREATE POLICY "reservations_update_admin"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: only admins can delete reservations
DROP POLICY IF EXISTS "reservations_delete_admin" ON public.reservations;
CREATE POLICY "reservations_delete_admin"
  ON public.reservations FOR DELETE
  TO authenticated
  USING (public.is_admin());
