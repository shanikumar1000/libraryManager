import { Link } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Bookmark, Clock, TrendingUp,
  AlertCircle, CheckCircle2, Calendar, ArrowRight, BookMarked,
} from 'lucide-react';
import { mockReservations, mockBooks } from '@/data/mockData';
import PageHeader from '@/components/PageHeader';
import { useDemoAuth } from '@/context/DemoAuthContext';

export default function Dashboard() {
  const { user } = useDemoAuth();
  const activeReservations = mockReservations.filter((r) => r.status === 'issued' || r.status === 'approved');
  const pendingReservations = mockReservations.filter((r) => r.status === 'pending');
  const returnedReservations = mockReservations.filter((r) => r.status === 'returned');

  const stats = [
    { icon: BookOpen, label: 'Books Borrowed', value: returnedReservations.length + activeReservations.length, color: 'text-primary-600', bg: 'bg-primary-50' },
    { icon: Bookmark, label: 'Active Reservations', value: activeReservations.length, color: 'text-success-600', bg: 'bg-success-50' },
    { icon: AlertCircle, label: 'Pending Approval', value: pendingReservations.length, color: 'text-warning-600', bg: 'bg-warning-50' },
    { icon: BookMarked, label: 'Total Reads', value: returnedReservations.length, color: 'text-accent-600', bg: 'bg-accent-50' },
  ];

  const reservedBookIds = mockReservations.filter((r) => r.status === 'issued').map((r) => r.bookId);
  const recommendedBooks = mockBooks.filter((b) => !reservedBookIds.includes(b.id) && b.status === 'available').slice(0, 3);

  return (
    <div>
      <PageHeader
        title="My Dashboard"
        subtitle={`Welcome back, ${user?.name ?? 'Reader'}`}
        icon={<LayoutDashboard className="h-6 w-6" />}
      >
        <Link to="/catalog" className="btn-primary">
          <BookOpen className="h-4 w-4" />
          Browse Books
        </Link>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="card p-5 animate-fade-in-up opacity-0"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 font-serif text-3xl text-neutral-900">{stat.value}</p>
                <p className="text-xs uppercase tracking-wider text-neutral-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Active & Overdue Reservations */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Current Reservations</h2>
              <span className="text-sm text-neutral-500">{activeReservations.length + pendingReservations.length} active</span>
            </div>

            <div className="mt-4 space-y-3">
              {[...activeReservations, ...pendingReservations].map((reservation, i) => {
                const isPending = reservation.status === 'pending';
                const book = mockBooks.find((b) => b.id === reservation.bookId);
                return (
                  <div
                    key={reservation.id}
                    className={`card flex items-center gap-4 p-4 animate-fade-in-up opacity-0 ${
                      isPending ? 'border-warning-200' : ''
                    }`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className={`h-16 w-12 flex-shrink-0 rounded-lg bg-gradient-to-br ${book?.coverColor ?? 'from-neutral-700 to-neutral-500'} flex items-center justify-center p-1`}>
                      <span className="font-serif text-[8px] leading-tight text-white/90 text-center line-clamp-3">{reservation.bookTitle}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/books/${reservation.bookId}`} className="font-medium text-neutral-900 hover:text-primary-700 transition-colors truncate block">
                        {reservation.bookTitle}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Reserved: {reservation.reservedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Due: {reservation.dueDate}
                        </span>
                      </div>
                    </div>
                    {isPending ? (
                      <span className="badge bg-warning-100 text-warning-700 flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    ) : (
                      <span className="badge bg-success-100 text-success-700 flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        {reservation.status === 'approved' ? 'Approved' : 'Issued'}
                      </span>
                    )}
                  </div>
                );
              })}

              {activeReservations.length === 0 && pendingReservations.length === 0 && (
                <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center">
                  <Bookmark className="mx-auto h-10 w-10 text-neutral-300" />
                  <p className="mt-3 text-sm text-neutral-500">No active reservations</p>
                  <Link to="/catalog" className="btn-secondary mt-4">
                    Find a book to reserve
                  </Link>
                </div>
              )}
            </div>

            {/* History */}
            {returnedReservations.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-neutral-900">Reading History</h2>
                <div className="mt-4 space-y-3">
                  {returnedReservations.map((reservation, i) => {
                    const book = mockBooks.find((b) => b.id === reservation.bookId);
                    return (
                      <div
                        key={reservation.id}
                        className="card flex items-center gap-4 p-4 animate-fade-in-up opacity-0"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div className={`h-14 w-10 flex-shrink-0 rounded-lg bg-gradient-to-br ${book?.coverColor ?? 'from-neutral-700 to-neutral-500'}`} />
                        <div className="flex-1 min-w-0">
                          <Link to={`/books/${reservation.bookId}`} className="font-medium text-neutral-600 hover:text-primary-700 transition-colors truncate block">
                            {reservation.bookTitle}
                          </Link>
                          <p className="text-xs text-neutral-400">Returned on {reservation.dueDate}</p>
                        </div>
                        <span className="badge bg-neutral-100 text-neutral-500 flex-shrink-0">
                          <CheckCircle2 className="h-3 w-3" />
                          Returned
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reading Goals */}
            <div className="card p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                <h3 className="font-semibold text-neutral-900">Reading Goal</h3>
              </div>
              <div className="mt-4">
                <div className="flex items-end justify-between">
                  <span className="font-serif text-3xl text-neutral-900">12</span>
                  <span className="text-sm text-neutral-500">/ 24 books this year</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all" style={{ width: '50%' }} />
                </div>
                <p className="mt-2 text-xs text-neutral-500">You're on track! 12 books to go.</p>
              </div>
            </div>

            {/* Recommended */}
            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900">Recommended for You</h3>
              <p className="mt-1 text-xs text-neutral-500">Based on your reading history</p>
              <div className="mt-4 space-y-3">
                {recommendedBooks.map((book) => (
                  <Link key={book.id} to={`/books/${book.id}`} className="flex items-center gap-3 group">
                    <div className={`h-14 w-10 flex-shrink-0 rounded-lg bg-gradient-to-br ${book.coverColor} flex items-center justify-center p-1`}>
                      <span className="font-serif text-[8px] leading-tight text-white/90 text-center line-clamp-3">{book.title}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-primary-700 transition-colors">{book.title}</p>
                      <p className="text-xs text-neutral-500">{book.author}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-neutral-300 group-hover:text-primary-600 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900">Quick Actions</h3>
              <div className="mt-4 space-y-2">
                <Link to="/catalog" className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                  Browse Catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/catalog" className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                  Search for a Book
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
