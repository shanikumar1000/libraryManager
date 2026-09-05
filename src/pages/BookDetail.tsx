import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, BookOpen, Calendar, Building2, Globe,
  MapPin, Tag, Bookmark, Share2, ChevronRight,
  CheckCircle2, AlertCircle, Loader2, LogIn,
} from 'lucide-react';
import type { Book } from '@/types';
import { fetchBookById, fetchRelatedBooks } from '@/lib/booksService';
import { createReservation, hasActiveReservation } from '@/lib/reservationsService';
import { useAuth } from '@/context/AuthContext';
import BookCard from '@/components/BookCard';

const statusConfig = {
  available: { label: 'Available', class: 'bg-success-100 text-success-700' },
  reserved: { label: 'Reserved', class: 'bg-warning-100 text-warning-700' },
  'checked-out': { label: 'Checked Out', class: 'bg-neutral-200 text-neutral-600' },
  maintenance: { label: 'Maintenance', class: 'bg-error-100 text-error-700' },
} as const;

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [related, setRelated] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [existingReservation, setExistingReservation] = useState(false);
  const [checkedExisting, setCheckedExisting] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    setBook(null);
    setRelated([]);

    fetchBookById(id)
      .then(async (fetchedBook) => {
        if (!active) return;
        if (!fetchedBook) return;
        setBook(fetchedBook);
        try {
          const relatedBooks = await fetchRelatedBooks(fetchedBook);
          if (active) setRelated(relatedBooks);
        } catch {
          // Related books failure is non-critical — leave empty
        }
      })
      .catch((err) => { if (active) setError(err.message ?? 'Failed to load book.'); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [id]);

  // Check if the current user already has an active reservation for this book
  useEffect(() => {
    if (!isAuthenticated || !user || !id || !book) {
      setExistingReservation(false);
      setCheckedExisting(false);
      return;
    }
    let active = true;
    setCheckedExisting(false);
    hasActiveReservation(id, user.id)
      .then((has) => { if (active) setExistingReservation(has); })
      .catch(() => { if (active) setExistingReservation(false); })
      .finally(() => { if (active) setCheckedExisting(true); });
    return () => { active = false; };
  }, [isAuthenticated, user, id, book]);

  const handleReserve = async () => {
    if (!user || !book) return;
    setReservationLoading(true);
    setReservationError(null);
    setReservationSuccess(false);

    try {
      const alreadyReserved = await hasActiveReservation(book.id, user.id);
      if (alreadyReserved) {
        setExistingReservation(true);
        setReservationError('You already have an active reservation for this book.');
        return;
      }

      await createReservation(book.id, user.id);
      setReservationSuccess(true);
      setExistingReservation(true);
    } catch (err) {
      setReservationError(
        err instanceof Error ? err.message : 'Failed to create reservation. Please try again.',
      );
    } finally {
      setReservationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600" />
        <p className="mt-3 text-sm text-neutral-500">Loading book...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <BookOpen className="mx-auto h-12 w-12 text-error-300" />
        <h1 className="mt-4 font-serif text-2xl text-neutral-900">Something went wrong</h1>
        <p className="mt-2 text-neutral-500">{error}</p>
        <Link to="/catalog" className="btn-primary mt-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <BookOpen className="mx-auto h-12 w-12 text-neutral-300" />
        <h1 className="mt-4 font-serif text-2xl text-neutral-900">Book not found</h1>
        <p className="mt-2 text-neutral-500">The book you're looking for doesn't exist or has been removed.</p>
        <Link to="/catalog" className="btn-primary mt-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  const status = statusConfig[book.status];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm sm:px-6 lg:px-8">
          <Link to="/" className="text-neutral-500 hover:text-neutral-900">Home</Link>
          <ChevronRight className="h-4 w-4 text-neutral-300" />
          <Link to="/catalog" className="text-neutral-500 hover:text-neutral-900">Catalog</Link>
          <ChevronRight className="h-4 w-4 text-neutral-300" />
          <span className="text-neutral-900 font-medium truncate">{book.title}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className={`relative aspect-[3/4] rounded-2xl bg-gradient-to-br ${book.coverColor} flex items-center justify-center p-8 shadow-xl`}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent" />
                <span className="relative font-serif text-2xl leading-tight text-white/95 text-center text-balance">
                  {book.title}
                </span>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-xs text-white/60">{book.author}</span>
                  <span className="text-xs text-white/60">{book.publishedYear}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {isAuthenticated ? (
                  <button
                    onClick={handleReserve}
                    disabled={
                      book.status !== 'available' ||
                      book.copiesAvailable === 0 ||
                      reservationLoading ||
                      reservationSuccess ||
                      existingReservation
                    }
                    className="btn-primary flex-1 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {reservationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Reserving...
                      </>
                    ) : reservationSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Reserved!
                      </>
                    ) : existingReservation ? (
                      <>
                        <Bookmark className="h-4 w-4" />
                        Already Reserved
                      </>
                    ) : book.status !== 'available' || book.copiesAvailable === 0 ? (
                      <>
                        <Bookmark className="h-4 w-4" />
                        Unavailable
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" />
                        Reserve Book
                      </>
                    )}
                  </button>
                ) : (
                  <Link to="/signin" state={{ from: `/books/${book.id}` }} className="btn-primary flex-1">
                    <LogIn className="h-4 w-4" />
                    Sign in to Reserve
                  </Link>
                )}
                <button className="btn-secondary">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {/* Reservation feedback messages */}
              {reservationSuccess && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>Reservation placed! Due date is 14 days from today. An admin will review your request.</span>
                </div>
              )}
              {reservationError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 animate-fade-in">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{reservationError}</span>
                </div>
              )}
              {isAuthenticated && existingReservation && !reservationSuccess && !reservationError && checkedExisting && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 animate-fade-in">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>You already have an active reservation for this book.</span>
                </div>
              )}

              {book.status === 'available' && (
                <p className="mt-3 text-center text-xs text-neutral-500">
                  {book.copiesAvailable} of {book.copiesTotal} copies available
                </p>
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 animate-fade-in-up opacity-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge ${status.class}`}>{status.label}</span>
              <span className="badge bg-primary-50 text-primary-700">{book.category}</span>
              {book.tags.map((tag) => (
                <span key={tag} className="badge bg-neutral-100 text-neutral-600">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mt-4 font-serif text-3xl text-neutral-900 sm:text-4xl">{book.title}</h1>
            <p className="mt-2 text-lg text-neutral-500">by {book.author}</p>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(book.rating)
                        ? 'fill-accent-400 text-accent-400'
                        : 'text-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-neutral-900">{book.rating.toFixed(1)}</span>
              <span className="text-sm text-neutral-500">({book.ratingCount.toLocaleString()} ratings)</span>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-neutral-900">Description</h2>
              <p className="mt-3 leading-relaxed text-neutral-600">{book.description}</p>
            </div>

            {/* Details Grid */}
            <div className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-neutral-200 bg-white p-6 sm:grid-cols-2">
              {[
                { icon: BookOpen, label: 'ISBN', value: book.isbn },
                { icon: Calendar, label: 'Published', value: String(book.publishedYear) },
                { icon: Building2, label: 'Publisher', value: book.publisher },
                { icon: BookOpen, label: 'Pages', value: `${book.pages} pages` },
                { icon: Globe, label: 'Language', value: book.language },
                { icon: MapPin, label: 'Shelf Location', value: book.location },
              ].map((detail) => {
                const Icon = detail.icon;
                return (
                  <div key={detail.label} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-400">{detail.label}</p>
                      <p className="text-sm font-medium text-neutral-900">{detail.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Copies availability bar */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-neutral-900">Copy Availability</h3>
              <div className="mt-3 flex items-center gap-4">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      book.copiesAvailable === 0
                        ? 'bg-error-400'
                        : book.copiesAvailable <= book.copiesTotal / 3
                        ? 'bg-warning-400'
                        : 'bg-success-400'
                    }`}
                    style={{ width: `${(book.copiesAvailable / book.copiesTotal) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  {book.copiesAvailable} / {book.copiesTotal}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Books */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="section-title">Related Books</h2>
            <p className="mt-2 text-neutral-500">You might also enjoy these</p>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((relBook, i) => (
                <BookCard key={relBook.id} book={relBook} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
