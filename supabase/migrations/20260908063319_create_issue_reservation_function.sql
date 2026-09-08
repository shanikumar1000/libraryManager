/*
# Create issue_reservation() function

1. New Function
- `issue_reservation(reservation_uuid)` — SECURITY DEFINER function that
  atomically issues an approved reservation:
  1. Verifies the caller is an admin via is_admin().
  2. Verifies the reservation exists and its status is 'approved'.
  3. Verifies the related book has copies_available > 0.
  4. Updates the reservation status to 'issued'.
  5. Decrements the book's copies_available by 1.
- All steps run in a single transaction — if any check fails, nothing changes.
- The `updated_at` trigger on both tables fires automatically, recording
  the issued timestamp.

2. Why a SECURITY DEFINER function
- The issue action spans two tables (reservations + books) and must be
  atomic. Client-side Supabase calls cannot wrap multi-table updates in
  a transaction, so a SECURITY DEFINER function is the correct pattern.
- The is_admin() guard ensures only admins can issue reservations.

3. Security
- `SECURITY DEFINER` with `search_path` locked to `public`.
- EXECUTE granted to `authenticated` only.
- Returns a JSON result with { success: boolean, error?: string }.

4. Important Notes
1. No table or column changes — this is a read/write function over
   existing tables only.
2. Uses only existing column names: reservations.id, reservations.status,
   reservations.book_id, books.id, books.copies_available.
3. The books table CHECK constraint (copies_available >= 0) provides a
   database-level safety net, but the function also checks explicitly
   so it can return a clear error message.
*/

CREATE OR REPLACE FUNCTION public.issue_reservation(reservation_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status     text;
  v_book_id    uuid;
  v_copies     integer;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can issue reservations.');
  END IF;

  SELECT status, book_id
    INTO v_status, v_book_id
    FROM public.reservations
    WHERE id = reservation_uuid
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found.');
  END IF;

  IF v_status <> 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only approved reservations can be issued. Current status: ' || v_status || '.');
  END IF;

  SELECT copies_available
    INTO v_copies
    FROM public.books
    WHERE id = v_book_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'The book for this reservation no longer exists.');
  END IF;

  IF v_copies <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No copies of this book are currently available.');
  END IF;

  UPDATE public.reservations
    SET status = 'issued'
    WHERE id = reservation_uuid;

  UPDATE public.books
    SET copies_available = copies_available - 1
    WHERE id = v_book_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.issue_reservation(uuid) TO authenticated;
