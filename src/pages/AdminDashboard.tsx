import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, BookOpen, Users, AlertCircle,
  CheckCircle2, Plus, ArrowRight,
  BookMarked, Activity, Search, SlidersHorizontal,
  Mail, Calendar, Clock, X, GraduationCap, BookText,
  Check, XCircle, RotateCcw, Ban,
} from 'lucide-react';
import { mockBooks, mockReservations } from '@/data/mockData';
import type { ReservationStatus } from '@/types';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';

const statusConfig: Record<ReservationStatus, { label: string; badge: string }> = {
  pending:   { label: 'Pending',   badge: 'bg-warning-100 text-warning-700' },
  approved:  { label: 'Approved',  badge: 'bg-primary-100 text-primary-700' },
  issued:    { label: 'Issued',    badge: 'bg-success-100 text-success-700' },
  returned:  { label: 'Returned',  badge: 'bg-neutral-200 text-neutral-600' },
  rejected:  { label: 'Rejected',  badge: 'bg-error-100 text-error-700' },
  cancelled: { label: 'Cancelled', badge: 'bg-neutral-200 text-neutral-500' },
};

const allStatuses: ReservationStatus[] = ['pending', 'approved', 'issued', 'returned', 'rejected', 'cancelled'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<ReservationStatus[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleStatus = (status: ReservationStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSearch('');
  };

  const filteredReservations = useMemo(() => {
    return mockReservations.filter((r) => {
      const matchesSearch =
        !search ||
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
        r.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(r.status);

      return matchesSearch && matchesStatus;
    });
  }, [search, selectedStatuses]);

  const totalBooks = mockBooks.length;
  const availableBooks = mockBooks.filter((b) => b.status === 'available').length;
  const issuedCount = mockReservations.filter((r) => r.status === 'issued').length;
  const pendingCount = mockReservations.filter((r) => r.status === 'pending').length;

  const stats = [
    { icon: BookOpen, label: 'Total Titles', value: totalBooks, color: 'text-primary-600', bg: 'bg-primary-50' },
    { icon: CheckCircle2, label: 'Available Now', value: availableBooks, color: 'text-success-600', bg: 'bg-success-50' },
    { icon: BookMarked, label: 'Issued Books', value: issuedCount, color: 'text-accent-600', bg: 'bg-accent-50' },
    { icon: AlertCircle, label: 'Pending Approvals', value: pendingCount, color: 'text-warning-600', bg: 'bg-warning-50' },
  ];

  const activeFilterCount = selectedStatuses.length;

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Welcome back, ${user?.name ?? 'Admin'}`}
        icon={<Shield className="h-6 w-6" />}
      >
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Book
        </button>
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
          {/* Reservation Management */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Reservation Management</h2>
              <span className="text-sm text-neutral-500">{filteredReservations.length} records</span>
            </div>

            {/* Search & Filter Bar */}
            <div className="mt-4 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by student, email, book, or reservation ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary relative ${showFilters ? 'border-primary-500 text-primary-600' : ''}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Status
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Status Filter Chips */}
            {showFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-2 animate-fade-in">
                {allStatuses.map((status) => {
                  const config = statusConfig[status];
                  const isSelected = selectedStatuses.includes(status);
                  return (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`badge transition-all ${
                        isSelected ? `${config.badge} ring-2 ring-offset-1 ring-current` : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-primary-600 hover:text-primary-700 ml-2">
                    Clear all
                  </button>
                )}
              </div>
            )}

            {/* Reservation Cards */}
            <div className="mt-4 space-y-3">
              {filteredReservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 py-16 text-center">
                  <Search className="h-10 w-10 text-neutral-300" />
                  <p className="mt-3 text-sm font-medium text-neutral-700">No reservations found</p>
                  <p className="mt-1 text-xs text-neutral-500">Try adjusting your search or filters</p>
                  <button onClick={clearFilters} className="btn-secondary mt-4">
                    Clear all filters
                  </button>
                </div>
              ) : (
                filteredReservations.map((reservation, i) => (
                  <ReservationCard key={reservation.id} reservation={reservation} index={i} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Summary */}
            <div className="card p-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-600" />
                <h3 className="font-semibold text-neutral-900">Library Activity</h3>
              </div>
              <div className="mt-4 space-y-4">
                {[
                  { icon: Users, label: 'Loans Today', value: '24', trend: '+12%' },
                  { icon: BookOpen, label: 'New Members', value: '8', trend: '+5%' },
                  { icon: RotateCcw, label: 'Returns Today', value: '15', trend: '-3%' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm text-neutral-600">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-serif text-lg text-neutral-900">{item.value}</span>
                        <span className={`ml-2 text-xs ${item.trend.startsWith('+') ? 'text-success-600' : 'text-error-500'}`}>
                          {item.trend}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900">Reservations by Status</h3>
              <div className="mt-4 space-y-3">
                {allStatuses.map((status) => {
                  const count = mockReservations.filter((r) => r.status === status).length;
                  const config = statusConfig[status];
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className={`badge ${config.badge}`}>{config.label}</span>
                      <span className="font-serif text-lg text-neutral-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900">Admin Actions</h3>
              <div className="mt-4 space-y-2">
                <Link to="/catalog" className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                  Manage Books
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/student/dashboard" className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                  View Student Dashboard
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

function ReservationCard({ reservation, index }: { reservation: typeof mockReservations[0]; index: number }) {
  const book = mockBooks.find((b) => b.id === reservation.bookId);
  const config = statusConfig[reservation.status];
  const isIssued = reservation.status === 'issued';

  return (
    <div
      className="card p-4 animate-fade-in-up opacity-0"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Book cover thumbnail */}
        <div className={`h-20 w-16 flex-shrink-0 rounded-lg bg-gradient-to-br ${book?.coverColor ?? 'from-neutral-700 to-neutral-500'} flex items-center justify-center p-2`}>
          <span className="font-serif text-[10px] leading-tight text-white/95 text-center line-clamp-3">
            {reservation.bookTitle}
          </span>
        </div>

        {/* Student → Book → Status details */}
        <div className="flex-1 min-w-0">
          {/* Student section */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600 flex-shrink-0">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium text-neutral-900 truncate">{reservation.studentName}</span>
            <span className={`badge ${config.badge} flex-shrink-0`}>{config.label}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-neutral-500 pl-9">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {reservation.studentEmail}
            </span>
          </div>

          {/* Book section */}
          <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 flex-shrink-0">
              <BookText className="h-3.5 w-3.5" />
            </div>
            <Link to={`/books/${reservation.bookId}`} className="font-medium text-neutral-700 hover:text-primary-700 transition-colors truncate">
              {reservation.bookTitle}
            </Link>
            {book && <span className="text-xs text-neutral-400 truncate hidden sm:inline">by {book.author}</span>}
          </div>

          {/* Dates */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-neutral-500 pl-9">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Reserved: {reservation.reservedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Due: {reservation.dueDate}
            </span>
          </div>

          {/* Highlight for issued books */}
          {isIssued && (
            <div className="mt-2 pl-9">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Currently held by {reservation.studentName}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-row flex-wrap gap-1.5 sm:flex-col sm:items-end">
          {reservation.status === 'pending' && (
            <>
              <button className="flex items-center gap-1.5 rounded-lg bg-success-50 px-3 py-1.5 text-xs font-medium text-success-700 transition-colors hover:bg-success-100">
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-error-50 px-3 py-1.5 text-xs font-medium text-error-600 transition-colors hover:bg-error-100">
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
            </>
          )}
          {reservation.status === 'approved' && (
            <button className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100">
              <BookMarked className="h-3.5 w-3.5" />
              Issue Book
            </button>
          )}
          {reservation.status === 'issued' && (
            <button className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-200">
              <RotateCcw className="h-3.5 w-3.5" />
              Mark Returned
            </button>
          )}
          {(reservation.status === 'pending' || reservation.status === 'approved') && (
            <button className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-200">
              <Ban className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
