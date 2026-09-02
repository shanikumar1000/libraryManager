import { Link } from 'react-router-dom';
import {
  Info, BookOpen, Users, Target, Heart, Award, ArrowRight,
  Library, Clock, Shield, Sparkles,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function About() {
  const values = [
    {
      icon: BookOpen,
      title: 'Universal Access',
      desc: 'We believe knowledge should be accessible to everyone, regardless of location or background.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      desc: 'Your reading history and personal data are protected with industry-leading security.',
    },
    {
      icon: Heart,
      title: 'Community Driven',
      desc: 'Built by readers, for readers. Your feedback shapes how our library evolves.',
    },
    {
      icon: Award,
      title: 'Quality Curated',
      desc: 'Every title in our collection is carefully selected to ensure a rich, diverse catalog.',
    },
  ];

  const milestones = [
    { year: '2015', title: 'Founded', desc: 'Athenaeum began as a small community book-sharing initiative.' },
    { year: '2018', title: 'Digital Launch', desc: 'We launched our online catalog with 5,000 titles.' },
    { year: '2021', title: '10,000 Members', desc: 'Reached our first major membership milestone.' },
    { year: '2024', title: '50,000+ Books', desc: 'Expanded our collection to over 50,000 titles across all genres.' },
  ];

  return (
    <div>
      <PageHeader
        title="About Athenaeum"
        subtitle="Connecting readers with knowledge since 2015"
        icon={<Info className="h-6 w-6" />}
      />

      {/* Mission Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-in-up opacity-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm text-primary-700">
              <Target className="h-4 w-4" />
              Our Mission
            </div>
            <h2 className="mt-5 section-title text-balance">
              Making knowledge accessible to everyone
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
              Athenaeum is more than a library — it's a digital gateway to the world's knowledge.
              We've reimagined the traditional library experience for the modern era, combining
              the warmth of a community bookshop with the power of digital technology.
            </p>
            <p className="mt-4 leading-relaxed text-neutral-600">
              Our platform serves over 12,000 members with a collection of more than 50,000 books
              spanning every genre and subject. Whether you're a casual reader, a student, or a
              lifelong learner, Athenaeum is here to support your journey.
            </p>
            <Link to="/signup" className="btn-primary mt-8">
              Join our community
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-fade-in-up opacity-0 [animation-delay:200ms]">
            {[
              { icon: BookOpen, value: '50,000+', label: 'Books in Collection' },
              { icon: Users, value: '12,000+', label: 'Active Members' },
              { icon: Library, value: '10', label: 'Categories' },
              { icon: Clock, value: '24/7', label: 'Online Access' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="card p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-4 font-serif text-3xl text-neutral-900">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-neutral-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-1.5 text-sm text-accent-700">
              <Sparkles className="h-4 w-4" />
              What We Stand For
            </div>
            <h2 className="mt-5 section-title">Our Core Values</h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="card p-6 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg text-neutral-900">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center">
          <h2 className="section-title">Our Journey</h2>
          <p className="mt-2 text-neutral-500">A decade of connecting readers with books</p>
        </div>

        <div className="mt-12 space-y-8">
          {milestones.map((milestone, i) => (
            <div
              key={milestone.year}
              className="flex gap-6 animate-fade-in-up opacity-0"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 font-serif text-sm text-white">
                  {milestone.year}
                </div>
                {i < milestones.length - 1 && <div className="mt-2 w-px flex-1 bg-neutral-200" />}
              </div>
              <div className="pb-4">
                <h3 className="font-serif text-xl text-neutral-900">{milestone.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{milestone.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl text-white sm:text-4xl text-balance">
            Ready to start your reading journey?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Join Athenaeum today and gain access to 50,000+ books, free of charge.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/signup" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30">
              Create a free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/catalog" className="btn-ghost text-primary-100 hover:bg-white/10 hover:text-white">
              Browse the catalog first
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
