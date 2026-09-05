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
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 14);

  const reservedDateStr = today.toISOString().slice(0, 10);
  const dueDateStr = dueDate.toISOString().slice(0, 10);

  const { error } = await supabase.from('reservations').insert({
    book_id: bookId,
    user_id: userId,
    reserved_date: reservedDateStr,
    due_date: dueDateStr,
    status: 'pending',
  });

  if (error) throw error;
}
