import { supabase } from '@/lib/supabaseClient';
import type { Book } from '@/types';

type BookRow = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  category: Book['category'];
  description: string;
  cover_color: string;
  status: Book['status'];
  copies_total: number;
  copies_available: number;
  published_year: number | null;
  publisher: string | null;
  pages: number | null;
  rating: number;
  rating_count: number;
  language: string;
  location: string | null;
  tags: string[];
  added_date: string;
};

function mapRowToBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    isbn: row.isbn ?? '',
    category: row.category,
    description: row.description,
    coverColor: row.cover_color,
    status: row.status,
    copiesTotal: row.copies_total,
    copiesAvailable: row.copies_available,
    publishedYear: row.published_year ?? 0,
    publisher: row.publisher ?? '',
    pages: row.pages ?? 0,
    rating: Number(row.rating),
    ratingCount: row.rating_count,
    language: row.language,
    location: row.location ?? '',
    tags: row.tags ?? [],
    addedDate: row.added_date,
  };
}

const SELECT_COLUMNS = `
  id, title, author, isbn, category, description, cover_color, status,
  copies_total, copies_available, published_year, publisher, pages,
  rating, rating_count, language, location, tags, added_date
`;

export async function fetchAllBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select(SELECT_COLUMNS)
    .order('title');

  if (error) throw error;
  return (data as BookRow[]).map(mapRowToBook);
}

export async function fetchBookById(id: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select(SELECT_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRowToBook(data as BookRow);
}

export async function fetchFeaturedBooks(limit = 4): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select(SELECT_COLUMNS)
    .gte('rating', 4.5)
    .order('rating', { ascending: false })
    .order('rating_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as BookRow[]).map(mapRowToBook);
}

export async function fetchNewArrivals(limit = 4): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select(SELECT_COLUMNS)
    .order('added_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as BookRow[]).map(mapRowToBook);
}

export async function fetchRelatedBooks(book: Book, limit = 4): Promise<Book[]> {
  if (book.tags.length > 0) {
    const { data, error } = await supabase
      .from('books')
      .select(SELECT_COLUMNS)
      .neq('id', book.id)
      .or(`category.eq.${book.category},tags.ov.{${book.tags.join(',')}}`)
      .limit(limit);

    if (error) throw error;
    return (data as BookRow[]).map(mapRowToBook);
  }

  const { data, error } = await supabase
    .from('books')
    .select(SELECT_COLUMNS)
    .neq('id', book.id)
    .eq('category', book.category)
    .limit(limit);

  if (error) throw error;
  return (data as BookRow[]).map(mapRowToBook);
}
