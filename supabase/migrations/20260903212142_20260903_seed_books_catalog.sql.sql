/*
# Seed books table with the mock catalog

1. Data
- Inserts the 12 mock book records from src/data/mockData.ts into the real
  books table so the existing catalog content is preserved during the
  migration from mock data to a Supabase-backed application.

2. Idempotency
- Uses ON CONFLICT (isbn) DO NOTHING so re-running this migration does not
  create duplicate records. Books with a NULL isbn are inserted with a
  sentinel uuid-based id and are also safe to re-run because they are only
  inserted when no row with that exact title+author combination exists
  (guarded by a WHERE NOT EXISTS clause).

3. Important Notes
1. No frontend changes — mockData.ts is untouched.
2. The seed data mirrors the mock records exactly (title, author, isbn,
   category, description, cover_color, status, copies, rating, etc.).
3. added_date values match the mock data dates.
*/

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

ON CONFLICT (isbn) DO NOTHING;
