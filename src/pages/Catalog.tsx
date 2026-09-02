import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid3x3, List as ListIcon, X } from 'lucide-react';
import { mockBooks } from '@/data/mockData';
import type { Book, BookCategory, BookStatus } from '@/types';
import BookCard from '@/components/BookCard';
import PageHeader from '@/components/PageHeader';

const allCategories: BookCategory[] = [
  'Fiction', 'Non-Fiction', 'Science', 'History', 'Biography',
  'Children', 'Fantasy', 'Mystery', 'Romance', 'Technology',
];

const allStatuses: BookStatus[] = ['available', 'reserved', 'checked-out', 'maintenance'];

type SortOption = 'relevance' | 'title' | 'author' | 'rating' | 'newest';

export default function Catalog() {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<BookCategory[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<BookStatus[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (cat: BookCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleStatus = (status: BookStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setSearch('');
    setSortBy('relevance');
  };

  const filteredBooks = useMemo(() => {
    let result: Book[] = mockBooks.filter((book) => {
      const matchesSearch =
        !search ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.isbn.includes(search);

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(book.category);

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(book.status);

      return matchesSearch && matchesCategory && matchesStatus;
    });

    switch (sortBy) {
      case 'title':
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        result = [...result].sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result = [...result].sort(
          (a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
        );
        break;
    }

    return result;
  }, [search, selectedCategories, selectedStatuses, sortBy]);

  const activeFilterCount = selectedCategories.length + selectedStatuses.length;

  return (
    <div>
      <PageHeader
        title="Browse Catalog"
        subtitle={`${filteredBooks.length} books available`}
        icon={<Search className="h-6 w-6" />}
      >
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="input-field w-auto py-2 text-sm"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="title">Title (A-Z)</option>
            <option value="author">Author (A-Z)</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
          <div className="hidden items-center rounded-lg border border-neutral-300 sm:flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex h-9 w-9 items-center justify-center rounded-l-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex h-9 w-9 items-center justify-center rounded-r-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search bar */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
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
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="w-64 flex-shrink-0 hidden lg:block animate-slide-in-right">
              <div className="sticky top-24 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900">Categories</h3>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-xs text-primary-600 hover:text-primary-700">
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    {allCategories.map((cat) => (
                      <label key={cat} className="flex cursor-pointer items-center gap-2.5 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500/20"
                        />
                        <span className={selectedCategories.includes(cat) ? 'text-neutral-900 font-medium' : 'text-neutral-600'}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-900">Availability</h3>
                  <div className="mt-3 space-y-2">
                    {allStatuses.map((status) => (
                      <label key={status} className="flex cursor-pointer items-center gap-2.5 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={() => toggleStatus(status)}
                          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500/20"
                        />
                        <span className={selectedStatuses.includes(status) ? 'text-neutral-900 font-medium' : 'text-neutral-600'}>
                          {status.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1">
            {filteredBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 py-20 text-center">
                <Search className="h-12 w-12 text-neutral-300" />
                <p className="mt-4 text-lg font-medium text-neutral-700">No books found</p>
                <p className="mt-1 text-sm text-neutral-500">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="btn-secondary mt-4">
                  Clear all filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredBooks.map((book, i) => (
                  <BookCard key={book.id} book={book} index={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBooks.map((book, i) => (
                  <CatalogListItem key={book.id} book={book} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogListItem({ book, index }: { book: Book; index: number }) {
  const statusConfig = {
    available: { label: 'Available', class: 'bg-success-100 text-success-700' },
    reserved: { label: 'Reserved', class: 'bg-warning-100 text-warning-700' },
    'checked-out': { label: 'Checked Out', class: 'bg-neutral-200 text-neutral-600' },
    maintenance: { label: 'Maintenance', class: 'bg-error-100 text-error-700' },
  };
  const status = statusConfig[book.status];

  return (
    <Link
      to={`/books/${book.id}`}
      className="card group flex items-center gap-4 p-4 animate-fade-in-up opacity-0"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`h-20 w-16 flex-shrink-0 rounded-lg bg-gradient-to-br ${book.coverColor} flex items-center justify-center p-2`}>
        <span className="font-serif text-[10px] leading-tight text-white/95 text-center line-clamp-3">{book.title}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-neutral-900 truncate group-hover:text-primary-700 transition-colors">{book.title}</h3>
        <p className="text-sm text-neutral-500">{book.author}</p>
        <p className="mt-1 text-xs text-neutral-400 line-clamp-1 hidden sm:block">{book.description}</p>
      </div>
      <div className="hidden md:flex flex-col items-end gap-2">
        <span className={`badge ${status.class}`}>{status.label}</span>
        <span className="text-xs text-neutral-400">{book.copiesAvailable}/{book.copiesTotal} copies</span>
      </div>
      <div className="flex md:hidden">
        <span className={`badge ${status.class}`}>{status.label}</span>
      </div>
    </Link>
  );
}
