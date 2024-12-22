'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Mitarbeiter',
};

const navigation = [
  { name: 'Übersicht', href: '/mitarbeiter' },
  { name: 'Sortieren', href: '/mitarbeiter/sortieren' },
];

function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="-mb-px flex space-x-8 px-4" aria-label="Tabs">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              ${isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }
            `}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

export default function MitarbeiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="border-b border-gray-200">
        <Navigation />
      </div>
      {children}
    </div>
  );
}
