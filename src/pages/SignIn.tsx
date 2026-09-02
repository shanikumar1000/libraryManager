import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Library, ArrowRight, GraduationCap, Shield, FlaskConical } from 'lucide-react';
import { useDemoAuth, type DemoRole } from '@/context/DemoAuthContext';

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useDemoAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn('student');
    navigate('/student/dashboard');
  };

  const handleDemoAccess = (role: DemoRole) => {
    signIn(role);
    navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-primary-950 p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(43,124,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(249,115,22,0.08),transparent_50%)]" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Library className="h-5 w-5" />
          </div>
          <span className="font-serif text-xl text-white">Athenaeum</span>
        </Link>

        <div className="relative">
          <h2 className="font-serif text-3xl leading-tight text-white text-balance">
            Welcome back to your library
          </h2>
          <p className="mt-4 text-neutral-300 leading-relaxed">
            Sign in to manage your reservations, track your reading goals, and discover
            your next great read.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <div>
              <p className="font-serif text-2xl text-primary-400">50,000+</p>
              <p className="text-xs uppercase tracking-wider text-neutral-400">Books</p>
            </div>
            <div className="h-12 w-px bg-neutral-700" />
            <div>
              <p className="font-serif text-2xl text-primary-400">12,000+</p>
              <p className="text-xs uppercase tracking-wider text-neutral-400">Members</p>
            </div>
            <div className="h-12 w-px bg-neutral-700" />
            <div>
              <p className="font-serif text-2xl text-primary-400">24/7</p>
              <p className="text-xs uppercase tracking-wider text-neutral-400">Access</p>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-neutral-400">
          &copy; {new Date().getFullYear()} Athenaeum Library System
        </p>
      </div>

      {/* Right panel - Form */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Library className="h-5 w-5" />
              </div>
              <span className="font-serif text-xl text-neutral-900">Athenaeum</span>
            </Link>
          </div>

          <h1 className="mt-8 font-serif text-3xl text-neutral-900 lg:mt-0">Sign In</h1>
          <p className="mt-2 text-sm text-neutral-500">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-neutral-700">Email Address</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">Password</label>
                <button type="button" className="text-xs text-primary-600 hover:text-primary-700">
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500/20" />
              Remember me for 30 days
            </label>

            <button type="submit" className="btn-primary w-full py-3">
              <LogIn className="h-4 w-4" />
              Sign In
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
              Sign up for free
            </Link>
          </p>

          {/* TEMPORARY: Demo role selection for frontend testing only.
              Remove this entire section when real Supabase auth is implemented. */}
          <div className="mt-8 border-t border-dashed border-neutral-200 pt-6">
            <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
              <FlaskConical className="h-4 w-4" />
              Demo Access (For Testing)
            </div>
            <p className="mt-2 text-center text-xs text-neutral-400">
              Skip the form and pick a role to explore the app instantly.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDemoAccess('student')}
                className="group flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:bg-primary-50 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-700">Student</span>
                <span className="text-[11px] text-neutral-400">Browse & reserve</span>
              </button>
              <button
                onClick={() => handleDemoAccess('admin')}
                className="group flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-accent-300 hover:bg-accent-50 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-600 transition-colors group-hover:bg-accent-600 group-hover:text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-neutral-700 group-hover:text-accent-700">Librarian/Admin</span>
                <span className="text-[11px] text-neutral-400">Manage library</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
