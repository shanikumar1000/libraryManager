/*
# Create books table with admin-managed RLS

1. New Objects
- `is_admin()` helper function — returns true when the current authenticated
  user's profile role is 'admin'. Uses a SECURITY DEFINER function so it can
  read the profiles table regardless of the caller's RLS. Search path locked
  to `public`.
- `books` table — stores the full library catalog.

2. books Table Columns
- `id` (uuid, primary key, defaults to gen_random_uuid())
- `title` (text, NOT NULL)
- `author` (text, NOT NULL)
- `isbn` (text, UNIQUE — nullable so records without an ISBN can still be stored)
- `category` (text, NOT NULL — constrained to the 10 known categories)
- `description` (text, NOT NULL DEFAULT '')
- `cover_color` (text, NOT NULL DEFAULT 'from-neutral-700 to-neutral-500')
- `status` (text, NOT NULL DEFAULT 'available' — constrained to available,
  reserved, checked-out, maintenance)
- `copies_total` (integer, NOT NULL DEFAULT 1, CHECK >= 0)
- `copies_available` (integer, NOT NULL DEFAULT 1, CHECK >= 0)
- `published_year` (integer)
- `publisher` (text)
- `pages` (integer, CHECK > 0 when present)
- `rating` (numeric(2,1), NOT NULL DEFAULT 0, CHECK 0–5)
- `rating_count` (integer, NOT NULL DEFAULT 0, CHECK >= 0)
- `language` (text, NOT NULL DEFAULT 'English')
- `location` (text)
- `tags` (text[], NOT NULL DEFAULT '{}')
- `added_date` (date, NOT NULL DEFAULT CURRENT_DATE)
- `created_at` (timestamptz, NOT NULL DEFAULT now())
- `updated_at` (timestamptz, NOT NULL DEFAULT now())
- Table-level CHECK: copies_available <= copies_total

3. Indexes
- `idx_books_status` on `status` (filtering by availability)
- `idx_books_category` on `category` (catalog browsing / filtering)
- `idx_books_author` on `author` (search by author)
- `idx_books_added_date` on `added_date` DESC (newest-first queries)

4. Automation
- `update_books_updated_at()` trigger function + trigger on books to keep
  `updated_at` current on every UPDATE.

5. Security
- RLS enabled on `books`.
- SELECT: any authenticated user (students and admins) can read all books.
- INSERT / UPDATE / DELETE: only admins (via is_admin()).
- EXECUTE on is_admin() is granted to authenticated so policies can call it.

6. Important Notes
1. is_admin() is SECURITY DEFINER and reads profiles.role for auth.uid().
   This is the single source of truth for admin checks — reused by
   reservations policies in the next migration.
2. No frontend changes in this migration.
*/

-- ---------------------------------------------------------------------------
-- is_admin() helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ---------------------------------------------------------------------------
-- books table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.books (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  author           text NOT NULL,
  isbn             text UNIQUE,
  category         text NOT NULL CHECK (
                     category IN ('Fiction','Non-Fiction','Science','History',
                                  'Biography','Children','Fantasy','Mystery',
                                  'Romance','Technology')
                   ),
  description      text NOT NULL DEFAULT '',
  cover_color      text NOT NULL DEFAULT 'from-neutral-700 to-neutral-500',
  status           text NOT NULL DEFAULT 'available' CHECK (
                     status IN ('available','reserved','checked-out','maintenance')
                   ),
  copies_total     integer NOT NULL DEFAULT 1 CHECK (copies_total >= 0),
  copies_available integer NOT NULL DEFAULT 1 CHECK (copies_available >= 0),
  published_year   integer,
  publisher        text,
  pages            integer CHECK (pages IS NULL OR pages > 0),
  rating           numeric(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  rating_count     integer NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  language         text NOT NULL DEFAULT 'English',
  location         text,
  tags             text[] NOT NULL DEFAULT '{}',
  added_date       date NOT NULL DEFAULT CURRENT_DATE,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT books_available_not_exceed_total CHECK (copies_available <= copies_total)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books (status);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books (category);
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books (author);
CREATE INDEX IF NOT EXISTS idx_books_added_date ON public.books (added_date DESC);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_books_updated_at()
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

DROP TRIGGER IF EXISTS trg_books_updated_at ON public.books;
CREATE TRIGGER trg_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_books_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- SELECT: authenticated users can read all books
DROP POLICY IF EXISTS "books_select_authenticated" ON public.books;
CREATE POLICY "books_select_authenticated"
  ON public.books FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: only admins
DROP POLICY IF EXISTS "books_insert_admin" ON public.books;
CREATE POLICY "books_insert_admin"
  ON public.books FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- UPDATE: only admins
DROP POLICY IF EXISTS "books_update_admin" ON public.books;
CREATE POLICY "books_update_admin"
  ON public.books FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: only admins
DROP POLICY IF EXISTS "books_delete_admin" ON public.books;
CREATE POLICY "books_delete_admin"
  ON public.books FOR DELETE
  TO authenticated
  USING (public.is_admin());
