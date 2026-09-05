/*
# Fix books table schema to match the application code

## Problem
The live `books` table was created with a different schema than what the
frontend code expects. The code queries for columns like `category`,
`cover_color`, `status`, `copies_total`, `rating`, `tags`, `added_date`,
etc. — but the live table only has `category_id`, `cover_image_url`,
`total_copies`, `available_copies`. The table is also empty (no seed data).

## Changes
1. Add all missing columns the application expects to the `books` table:
   - `category` (text, NOT NULL, CHECK constrained to 10 known categories)
   - `cover_color` (text, NOT NULL DEFAULT 'from-neutral-700 to-neutral-500')
   - `status` (text, NOT NULL DEFAULT 'available', CHECK constrained)
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
   - Table-level CHECK: copies_available <= copies_total

2. Add indexes for status, category, author, added_date.

3. Create `update_books_updated_at()` trigger function + trigger.

4. Fix RLS policies:
   - Replace the existing FOR ALL "Admins can manage books" policy with
     4 separate per-verb policies (INSERT, UPDATE, DELETE for admin only).
   - Add anon to the SELECT policy so unauthenticated visitors can browse
     the public catalog.

5. Seed the 12 book records from the mock catalog data.

## Important Notes
1. No existing columns are dropped or renamed — only new columns are added.
2. The old columns (`category_id`, `cover_image_url`, `total_copies`,
   `available_copies`) remain in the table but are unused by the app.
3. The table is currently empty, so adding NOT NULL columns is safe.
4. The seed data mirrors the mock records exactly.
*/

-- ---------------------------------------------------------------------------
-- 1. Add missing columns
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'category') THEN
    ALTER TABLE public.books ADD COLUMN category text NOT NULL DEFAULT 'Fiction'
      CHECK (category IN ('Fiction','Non-Fiction','Science','History',
                          'Biography','Children','Fantasy','Mystery',
                          'Romance','Technology'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'cover_color') THEN
    ALTER TABLE public.books ADD COLUMN cover_color text NOT NULL DEFAULT 'from-neutral-700 to-neutral-500';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'status') THEN
    ALTER TABLE public.books ADD COLUMN status text NOT NULL DEFAULT 'available'
      CHECK (status IN ('available','reserved','checked-out','maintenance'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'copies_total') THEN
    ALTER TABLE public.books ADD COLUMN copies_total integer NOT NULL DEFAULT 1 CHECK (copies_total >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'copies_available') THEN
    ALTER TABLE public.books ADD COLUMN copies_available integer NOT NULL DEFAULT 1 CHECK (copies_available >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'published_year') THEN
    ALTER TABLE public.books ADD COLUMN published_year integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'publisher') THEN
    ALTER TABLE public.books ADD COLUMN publisher text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'pages') THEN
    ALTER TABLE public.books ADD COLUMN pages integer CHECK (pages IS NULL OR pages > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'rating') THEN
    ALTER TABLE public.books ADD COLUMN rating numeric(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'rating_count') THEN
    ALTER TABLE public.books ADD COLUMN rating_count integer NOT NULL DEFAULT 0 CHECK (rating_count >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'language') THEN
    ALTER TABLE public.books ADD COLUMN language text NOT NULL DEFAULT 'English';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'location') THEN
    ALTER TABLE public.books ADD COLUMN location text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'tags') THEN
    ALTER TABLE public.books ADD COLUMN tags text[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'added_date') THEN
    ALTER TABLE public.books ADD COLUMN added_date date NOT NULL DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Table-level CHECK for copies_available <= copies_total
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
    WHERE conname = 'books_available_not_exceed_total' AND conrelid = 'public.books'::regclass) THEN
    ALTER TABLE public.books ADD CONSTRAINT books_available_not_exceed_total
      CHECK (copies_available <= copies_total);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books (status);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books (category);
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books (author);
CREATE INDEX IF NOT EXISTS idx_books_added_date ON public.books (added_date DESC);

-- ---------------------------------------------------------------------------
-- 3. Updated_at trigger
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
-- 4. RLS policies — split FOR ALL into per-verb, add anon SELECT
-- ---------------------------------------------------------------------------
-- Drop the existing FOR ALL policy
DROP POLICY IF EXISTS "Admins can manage books" ON public.books;
DROP POLICY IF EXISTS "books_select_authenticated" ON public.books;
DROP POLICY IF EXISTS "books_insert_admin" ON public.books;
DROP POLICY IF EXISTS "books_update_admin" ON public.books;
DROP POLICY IF EXISTS "books_delete_admin" ON public.books;

-- SELECT: anyone (anon + authenticated) can browse the public catalog
CREATE POLICY "books_select_all"
  ON public.books FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: only admins
CREATE POLICY "books_insert_admin"
  ON public.books FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- UPDATE: only admins
CREATE POLICY "books_update_admin"
  ON public.books FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: only admins
CREATE POLICY "books_delete_admin"
  ON public.books FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. Seed the 12 book records
-- ---------------------------------------------------------------------------
INSERT INTO public.books
  (title, author, isbn, category, description, cover_color, status,
   copies_total, copies_available, published_year, publisher, pages,
   rating, rating_count, language, location, tags, added_date)
VALUES
  ('The Silent Patient', 'Alex Michaelides', '978-1250301697', 'Mystery',
   'A psychological thriller about a woman who shoots her husband and then never speaks another word. A psychotherapist becomes obsessed with breaking her silence.',
   'from-neutral-800 to-neutral-600', 'available', 5, 3, 2019, 'Celadon Books', 336,
   4.3, 1280, 'English', 'A-12-Fiction',
   ARRAY['psychological','thriller','suspense'], '2024-01-15'),

  ('Atomic Habits', 'James Clear', '978-0735211292', 'Non-Fiction',
   'An easy and proven way to build good habits and break bad ones. A comprehensive guide to making small changes that lead to remarkable results.',
   'from-primary-700 to-primary-500', 'available', 8, 2, 2018, 'Avery', 320,
   4.8, 5420, 'English', 'B-05-NonFiction',
   ARRAY['self-help','productivity','habits'], '2024-02-20'),

  ('A Brief History of Time', 'Stephen Hawking', '978-0553380163', 'Science',
   'From the Big Bang to Black Holes. A landmark exploration of cosmology that explores the fundamental questions of the universe.',
   'from-neutral-900 to-neutral-700', 'checked-out', 4, 0, 1998, 'Bantam', 256,
   4.5, 3200, 'English', 'C-03-Science',
   ARRAY['physics','cosmology','astronomy'], '2024-03-10'),

  ('The Name of the Wind', 'Patrick Rothfuss', '978-0756404741', 'Fantasy',
   'The riveting first-person narrative of a young man who grows to be the most notorious wizard his world has ever seen.',
   'from-amber-700 to-amber-500', 'available', 6, 4, 2007, 'DAW Books', 662,
   4.6, 2800, 'English', 'D-08-Fantasy',
   ARRAY['magic','adventure','epic'], '2024-01-05'),

  ('Educated', 'Tara Westover', '978-0399560194', 'Biography',
   'A memoir about a young woman who, kept out of school by her survivalist parents, educates herself enough to leave her world behind.',
   'from-stone-700 to-stone-500', 'reserved', 5, 1, 2018, 'Random House', 352,
   4.7, 4100, 'English', 'B-07-Biography',
   ARRAY['memoir','education','family'], '2024-02-28'),

  ('Sapiens', 'Yuval Noah Harari', '978-0062316097', 'History',
   'A brief history of humankind. Exploring how Homo sapiens evolved from insignificant apes to rulers of the planet.',
   'from-orange-800 to-orange-600', 'available', 7, 5, 2015, 'Harper', 464,
   4.4, 6800, 'English', 'E-02-History',
   ARRAY['anthropology','history','evolution'], '2024-03-15'),

  ('Clean Code', 'Robert C. Martin', '978-0132350884', 'Technology',
   'A handbook of agile software craftsmanship. Principles and patterns for writing code that is easy to maintain and extend.',
   'from-emerald-800 to-emerald-600', 'available', 4, 2, 2008, 'Prentice Hall', 464,
   4.3, 2100, 'English', 'F-01-Technology',
   ARRAY['programming','software','best-practices'], '2024-04-01'),

  ('Where the Crawdads Sing', 'Delia Owens', '978-0735219090', 'Fiction',
   'A coming-of-age story wrapped in a mystery, set in the marshes of North Carolina, following a young girl raised in isolation.',
   'from-teal-800 to-teal-600', 'available', 6, 1, 2018, 'G.P. Putnam', 384,
   4.5, 3900, 'English', 'A-14-Fiction',
   ARRAY['mystery','coming-of-age','nature'], '2024-02-10'),

  ('The Midnight Library', 'Matt Haig', '978-0525559474', 'Fiction',
   'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life.',
   'from-indigo-900 to-indigo-700', 'checked-out', 5, 0, 2020, 'Viking', 304,
   4.1, 5100, 'English', 'A-09-Fiction',
   ARRAY['philosophical','fantasy','drama'], '2024-03-20'),

  ('Pride and Prejudice', 'Jane Austen', '978-1503290563', 'Romance',
   'A classic novel of manners that follows the emotional development of Elizabeth Bennet as she learns about the complications of hasty judgments.',
   'from-rose-800 to-rose-600', 'available', 10, 7, 1813, 'Public Domain', 432,
   4.6, 8900, 'English', 'G-05-Romance',
   ARRAY['classic','romance','regency'], '2024-01-01'),

  ('The Very Hungry Caterpillar', 'Eric Carle', '978-0399226908', 'Children',
   'A beloved childrens picture book following the journey of a caterpillar as it eats its way through various foods before transforming.',
   'from-green-700 to-green-500', 'available', 12, 9, 1994, 'Philomel Books', 26,
   4.8, 12000, 'English', 'H-01-Children',
   ARRAY['picture-book','classic','nature'], '2024-01-10'),

  ('Gone Girl', 'Gillian Flynn', '978-0307588371', 'Mystery',
   'A psychological thriller about a marriage gone wrong. When his wife disappears, Nick becomes the prime suspect.',
   'from-slate-800 to-slate-600', 'maintenance', 5, 0, 2012, 'Crown Publishing', 432,
   4.2, 3400, 'English', 'A-17-Fiction',
   ARRAY['psychological','thriller','crime'], '2024-04-05')

ON CONFLICT DO NOTHING;
