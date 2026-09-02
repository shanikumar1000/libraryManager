import { Link } from 'react-router-dom';
import {
  Search, BookOpen, Users, TrendingUp, ArrowRight,
  Sparkles, Library, Clock, Shield, Star,
} from 'lucide-react';
import { getFeaturedBooks, getNewArrivals, categories } from '@/data/mockData';
import BookCard from '@/components/BookCard';

const categoryIcons: Record<string, typeof Search> = {
  BookOpen, Lightbulb: BookOpen, FlaskConical: Search, Landmark: Search,
  User: Users, Sparkles, Search, Baby: Users, Cpu: TrendingUp, Heart: Users,
};

export default function Home() {
  const featured = getFeaturedBooks();
  const newArrivals = getNewArrivals();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-primary-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(43,124,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(249,115,22,0.08),transparent_50%)]" />

        {/* Floating decorative elements */}
        <div className="absolute top-20 right-10 hidden lg:block animate-float">
          <div className="h-32 w-24 rotate-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 opacity-20 blur-xl" />
        </div>
        <div className="absolute bottom-20 right-32 hidden lg:block animate-float [animation-delay:2s]">
          <div className="h-28 w-20 -rotate-6 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 opacity-15 blur-xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-neutral-300 backdrop-blur-sm animate-fade-in">
              <Sparkles className="h-4 w-4 text-accent-400" />
              Over 50,000 books at your fingertips
            </div>

            <h1 className="mt-6 font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl text-balance animate-fade-in-up opacity-0">
              Your gateway to <span className="text-primary-400">knowledge</span> and discovery
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300 animate-fade-in-up opacity-0 [animation-delay:200ms]">
              Browse our extensive collection, reserve books online, and manage your reading
              journey — all from one elegant platform.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-xl border border-white/10 bg-white/10 p-2 backdrop-blur-lg animate-fade-in-up opacity-0 [animation-delay:400ms]">
              <Search className="ml-2 h-5 w-5 flex-shrink-0 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                className="flex-1 bg-transparent text-sm text-white placeholder-neutral-400 focus:outline-none"
              />
              <Link to="/catalog" className="btn-primary">
                Search
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-neutral-400 animate-fade-in-up opacity-0 [animation-delay:600ms]">
              <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary-400" /> 50,000+ titles</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary-400" /> 12,000+ members</span>
              <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary-400" /> 1,500+ daily loans</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-neutral-200 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: BookOpen, label: 'Total Books', value: '50,000+' },
            { icon: Users, label: 'Active Members', value: '12,000+' },
            { icon: Clock, label: 'Avg. Loan Period', value: '14 days' },
            { icon: Star, label: 'Member Rating', value: '4.8/5' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center gap-2 py-6 text-center">
                <Icon className="h-6 w-6 text-primary-600" />
                <span className="font-serif text-2xl text-neutral-900">{stat.value}</span>
                <span className="text-xs uppercase tracking-wider text-neutral-500">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Books */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">Featured Picks</h2>
            <p className="mt-2 text-neutral-500">Highest-rated books in our collection</p>
          </div>
          <Link to="/catalog" className="hidden items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 sm:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-neutral-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="section-title">Browse by Category</h2>
            <p className="mt-2 text-neutral-500">Find exactly what you're looking for</p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat, i) => {
              const Icon = categoryIcons[cat.icon] ?? BookOpen;
              return (
                <Link
                  key={cat.label}
                  to="/catalog"
                  className="card group flex flex-col items-center gap-3 p-5 text-center animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{cat.label}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">{cat.count} books</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">New Arrivals</h2>
            <p className="mt-2 text-neutral-500">Recently added to our collection</p>
          </div>
          <Link to="/catalog" className="hidden items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 sm:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {newArrivals.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      </section>

      {/* Features / How It Works */}
      <section className="bg-neutral-900 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl text-white sm:text-4xl">How It Works</h2>
            <p className="mt-2 text-neutral-400">Three simple steps to your next great read</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Search, step: '01', title: 'Discover', desc: 'Search our catalog of 50,000+ books by title, author, category, or ISBN.' },
              { icon: BookOpen, step: '02', title: 'Reserve', desc: 'Reserve books online with a single click and pick them up at your convenience.' },
              { icon: Library, step: '03', title: 'Enjoy', desc: "Read at your own pace, track your history, and return when you're done." },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="relative rounded-2xl border border-neutral-800 bg-neutral-800/50 p-8 transition-colors hover:border-primary-600/50 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <span className="absolute top-6 right-6 font-serif text-4xl text-neutral-700">{feature.step}</span>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600 text-white">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Shield className="mx-auto h-12 w-12 text-primary-300" />
          <h2 className="mt-6 font-serif text-3xl text-white sm:text-4xl text-balance">
            Become a member today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Join thousands of readers who manage their reading journey with Athenaeum.
            Free to join, no hidden fees.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30">
              Create an account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/about" className="btn-ghost text-primary-100 hover:bg-white/10 hover:text-white">
              Learn more
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
