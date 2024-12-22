'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/mitarbeiter', label: 'Übersicht' },
  { href: '/mitarbeiter/sortieren', label: 'Sortieren' },
];

export default function MitarbeiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <nav className="flex space-x-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            {links.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}
