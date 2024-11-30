'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { 
  BuildingOfficeIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  ClockIcon,
  CogIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Arbeitsplan', href: '/arbeitsplan3', icon: CalendarIcon },
  { name: 'Schichten', href: '/schichten2', icon: ClockIcon },
  { name: 'Filialen', href: '/stores', icon: BuildingOfficeIcon },
  { name: 'Mitarbeiter', href: '/employees', icon: UserGroupIcon },
  { name: 'Logbuch', href: '/logbuch', icon: ClipboardDocumentListIcon },
  { name: 'Einstellungen', href: '/settings', icon: CogIcon },
  { name: 'Hilfe', href: '/help', icon: QuestionMarkCircleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavigationLinks = () => (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold mx-2
                      ${isActive
                        ? 'bg-gray-50 text-blue-600'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={`h-6 w-6 shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
      </ul>
    </nav>
  );

  return (
    <>
      {/* Mobile menu */}
      <div className="lg:hidden">
        <button
          type="button"
          className="fixed top-4 left-4 z-40"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6 text-gray-700" aria-hidden="true" />
        </button>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-gray-900/80" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-6">
                <h1 className="text-xl font-semibold text-gray-900">Arbeitsplan</h1>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="px-4 py-4">
                <NavigationLinks />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Arbeitsplan</h1>
          </div>
          <NavigationLinks />
        </div>
      </div>
    </>
  );
}
