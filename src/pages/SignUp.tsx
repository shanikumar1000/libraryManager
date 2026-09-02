import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, BookMarked, Library, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signUpError } = await signUp(email, password, name);
    if (signUpError) {
      setError(signUpError);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
    // After signup, Supabase auto-signs-in the user (email confirmation is off).
    // Navigate to the student dashboard after a brief delay for the auth state to settle.
    setTimeout(() => {
      navigate('/student/dashboard', { replace: true });
    }, 1500);
  };

  const benefits = [
    'Reserve books online instantly',
    'Track your reading history and goals',
    'Get personalized recommendations',
    'Access to 50,000+ titles',
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left panel - Form */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2 order-2 lg:order-1">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Library className="h-5 w-5" />
              </div>
              <span className="font-serif text-xl text-neutral-900">Athenaeum</span>
            </Link>
          </div>

          <h1 className="mt-8 font-serif text-3xl text-neutral-900 lg:mt-0">Create Account</h1>
          <p className="mt-2 text-sm text-neutral-500">Join thousands of readers today — it's free</p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
              <Check className="h-4 w-4 flex-shrink-0" />
              <span>Account created! Redirecting to your dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-neutral-700">Full Name</label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="input-field pl-10"
                />
              </div>
            </div>

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
              <label className="text-sm font-medium text-neutral-700">Password</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

            <label className="flex items-start gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500/20"
              />
              <span>
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              <BookMarked className="h-4 w-4" />
              {loading ? 'Creating account...' : 'Create Account'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-neutral-900 p-12 lg:flex order-1 lg:order-2">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(43,124,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.08),transparent_50%)]" />

        <Link to="/" className="relative flex items-center gap-2.5 justify-end">
          <span className="font-serif text-xl text-white">Athenaeum</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white">
            <Library className="h-5 w-5" />
          </div>
        </Link>

        <div className="relative">
          <h2 className="font-serif text-3xl leading-tight text-white text-balance">
            Your next great read is waiting
          </h2>
          <p className="mt-4 text-neutral-300 leading-relaxed">
            Membership is completely free and gives you access to our entire collection
            of over 50,000 books.
          </p>

          <ul className="mt-8 space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-neutral-200">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-500">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-neutral-400">
          &copy; {new Date().getFullYear()} Athenaeum Library System
        </p>
      </div>
    </div>
  );
}
