export type BookStatus = 'available' | 'reserved' | 'checked-out' | 'maintenance';

export type BookCategory =
  | 'Fiction'
  | 'Non-Fiction'
  | 'Science'
  | 'History'
  | 'Biography'
  | 'Children'
  | 'Fantasy'
  | 'Mystery'
  | 'Romance'
  | 'Technology';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: BookCategory;
  description: string;
  coverColor: string;
  status: BookStatus;
  copiesTotal: number;
  copiesAvailable: number;
  publishedYear: number;
  publisher: string;
  pages: number;
  rating: number;
  ratingCount: number;
  language: string;
  location: string;
  tags: string[];
  addedDate: string;
}

export type ReservationStatus =
  | 'pending'
  | 'approved'
  | 'issued'
  | 'returned'
  | 'rejected'
  | 'cancelled';

export interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  studentId: string;
}

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  reservedDate: string;
  dueDate: string;
  status: ReservationStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'librarian' | 'admin';
  joinedDate: string;
  borrowedCount: number;
  reservedCount: number;
}

export interface NavLinkItem {
  label: string;
  to: string;
  icon: string;
}
