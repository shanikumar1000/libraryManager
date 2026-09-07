import { supabase } from '@/lib/supabaseClient';

const ACTIVE_STATUSES = ['pending', 'approved', 'issued'];

export async function hasActiveReservation(
  bookId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('reservations')
    .select('id')
    .eq('book_id', bookId)
    .eq('user_id', userId)
    .in('status', ACTIVE_STATUSES)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

export async function createReservation(
  bookId: string,
  userId: string,
): Promise<void> {
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 14);

  const { error } = await supabase.from('reservations').insert({
    book_id: bookId,
    user_id: userId,
    status: 'pending',
    reserved_at: now.toISOString(),
    due_date: dueDate.toISOString().slice(0, 10),
  });

  if (error) throw error;
}
