import { supabase } from '@/lib/supabaseClient';
import type { ReservationStatus } from '@/types';

export interface AdminReservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverColor: string;
  userId: string;
  userName: string;
  userEmail: string;
  reservedDate: string;
  dueDate: string;
  status: ReservationStatus;
}

type AdminReservationRow = {
  id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_cover_color: string;
  user_id: string;
  user_name: string;
  user_email: string;
  reserved_date: string;
  due_date: string;
  status: string;
};

function mapRowToReservation(row: AdminReservationRow): AdminReservation {
  return {
    id: row.id,
    bookId: row.book_id,
    bookTitle: row.book_title,
    bookAuthor: row.book_author,
    bookCoverColor: row.book_cover_color,
    userId: row.user_id,
    userName: row.user_name ?? 'Unknown',
    userEmail: row.user_email ?? '',
    reservedDate: row.reserved_date,
    dueDate: row.due_date,
    status: row.status as ReservationStatus,
  };
}

export async function fetchAdminReservations(): Promise<AdminReservation[]> {
  const { data, error } = await supabase.rpc('get_admin_reservations');

  if (error) throw error;
  if (!data) return [];
  return (data as AdminReservationRow[]).map(mapRowToReservation);
}

const validTransitions: Record<string, ('approved' | 'rejected')[]> = {
  pending: ['approved', 'rejected'],
};

export function canTransition(
  currentStatus: ReservationStatus,
  newStatus: 'approved' | 'rejected',
): boolean {
  const allowed = validTransitions[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
}

export async function updateReservationStatus(
  reservationId: string,
  currentStatus: ReservationStatus,
  newStatus: 'approved' | 'rejected',
): Promise<void> {
  if (!canTransition(currentStatus, newStatus)) {
    throw new Error(
      `Cannot ${newStatus === 'approved' ? 'approve' : 'reject'} a reservation that is "${currentStatus}". Only pending reservations can be approved or rejected.`,
    );
  }

  const { data, error } = await supabase
    .from('reservations')
    .update({ status: newStatus })
    .eq('id', reservationId)
    .eq('status', 'pending')
    .select('id');

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('This reservation is no longer pending and could not be updated. It may have been modified by another admin.');
  }
}

export async function issueReservation(
  reservationId: string,
  currentStatus: ReservationStatus,
): Promise<void> {
  if (currentStatus !== 'approved') {
    throw new Error(
      `Cannot issue a reservation that is "${currentStatus}". Only approved reservations can be issued.`,
    );
  }

  const { data, error } = await supabase.rpc('issue_reservation', {
    reservation_uuid: reservationId,
  });

  if (error) throw error;

  const result = data as { success?: boolean; error?: string } | null;
  if (!result || !result.success) {
    throw new Error(result?.error ?? 'Failed to issue reservation.');
  }
}
