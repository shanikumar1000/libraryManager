import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Library, Search, Menu, X, BookMarked, Info, LogIn, LogOut, GraduationCap, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, role, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Catalog', to: '/catalog', icon: Search },
    { label: 'About', to: '/about', icon: Info },
    ...(isAuthenticated && role === 'student'
      ? [{ label: 'My Dashboard', to: '/student/dashboard', icon: BookMarked }]
      : []),
    ...(isAuthenticated && role === 'admin'
      ? [{ label: 'Admin Dashboard', to: '/admin/dashboard', icon: Shield }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white transition-transform group-hover:scale-105">
            <Library className="h-5 w-5" />
          </div>
          <span className="font-serif text-xl text-neutral-900">Athenaeum</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1.5">
                {role === 'admin' ? (
                  <Shield className="h-4 w-4 text-accent-600" />
                ) : (
                  <GraduationCap className="h-4 w-4 text-primary-600" />
                )}
                <span className="text-sm font-medium text-neutral-700">
                  {user?.name}
                </span>
              </div>
              <button onClick={handleSignOut} className="btn-ghost">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn-ghost">
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary">
                <BookMarked className="h-4 w-4" />
                Join Library
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 pb-4 pt-2 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              );
            })}
            <div className="mt-2 flex flex-col gap-2 border-t border-neutral-200 pt-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700">
                    {role === 'admin' ? (
                      <Shield className="h-4 w-4 text-accent-600" />
                    ) : (
                      <GraduationCap className="h-4 w-4 text-primary-600" />
                    )}
                    {user?.name}
                  </div>
                  <button onClick={handleSignOut} className="btn-secondary w-full">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setMobileOpen(false)} className="btn-secondary w-full">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary w-full">
                    <BookMarked className="h-4 w-4" />
                    Join Library
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
