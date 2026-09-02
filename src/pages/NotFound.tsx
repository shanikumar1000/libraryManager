import { Link } from 'react-router-dom';
import { Home, BookOpen, Library } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="flex items-center gap-3">
        <Library className="h-16 w-16 text-primary-600" />
      </div>
      <h1 className="mt-8 font-serif text-6xl text-neutral-900">404</h1>
      <p className="mt-2 text-lg text-neutral-500">This page seems to have been shelved elsewhere</p>
      <p className="mt-1 text-sm text-neutral-400">The page you're looking for doesn't exist or has been moved.</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/" className="btn-primary">
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
        <Link to="/catalog" className="btn-secondary">
          <BookOpen className="h-4 w-4" />
          Browse Catalog
        </Link>
      </div>
    </div>
  );
}
