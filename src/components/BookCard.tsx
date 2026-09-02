import type { Book } from '@/types';
import { Link } from 'react-router-dom';
import { Star, BookOpen, MapPin } from 'lucide-react';

interface BookCardProps {
  book: Book;
  index?: number;
}

export default function BookCard({ book, index = 0 }: BookCardProps) {
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
      className="card group flex flex-col overflow-hidden animate-fade-in-up opacity-0"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`relative h-44 bg-gradient-to-br ${book.coverColor} flex items-center justify-center p-6`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="relative font-serif text-lg leading-tight text-white/95 text-center text-balance">
          {book.title}
        </span>
        <span className={`absolute top-3 right-3 badge ${status.class} backdrop-blur-sm`}>
          {status.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium text-neutral-900 line-clamp-1 group-hover:text-primary-700 transition-colors">
          {book.title}
        </h3>
        <p className="mt-1 text-sm text-neutral-500">{book.author}</p>

        <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
            {book.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {book.pages}p
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {book.location}
          </span>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-neutral-100">
          <span className="badge bg-primary-50 text-primary-700">{book.category}</span>
          <span className="text-xs text-neutral-400">
            {book.copiesAvailable}/{book.copiesTotal} copies
          </span>
        </div>
      </div>
    </Link>
  );
}
