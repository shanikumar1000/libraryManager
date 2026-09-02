import { Link } from 'react-router-dom';
import { Library, Mail, Phone, MapPin, Github, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-900 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Library className="h-5 w-5" />
              </div>
              <span className="font-serif text-xl text-white">Athenaeum</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400">
              A modern library management system connecting readers with knowledge.
              Discover, reserve, and manage books from anywhere.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { icon: Github, label: 'GitHub' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Facebook, label: 'Facebook' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 transition-colors hover:bg-primary-600 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/catalog" className="text-neutral-400 transition-colors hover:text-white">Browse Catalog</Link></li>
              <li><Link to="/dashboard" className="text-neutral-400 transition-colors hover:text-white">My Dashboard</Link></li>
              <li><Link to="/about" className="text-neutral-400 transition-colors hover:text-white">About Us</Link></li>
              <li><Link to="/signup" className="text-neutral-400 transition-colors hover:text-white">Become a Member</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-neutral-400">
                <MapPin className="h-4 w-4 flex-shrink-0 text-neutral-500" />
                123 Library Lane, Knowledge City
              </li>
              <li className="flex items-center gap-2 text-neutral-400">
                <Phone className="h-4 w-4 flex-shrink-0 text-neutral-500" />
                (555) 123-4567
              </li>
              <li className="flex items-center gap-2 text-neutral-400">
                <Mail className="h-4 w-4 flex-shrink-0 text-neutral-500" />
                hello@athenaeum.library
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-800 pt-6 text-center text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} Athenaeum Library System. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
