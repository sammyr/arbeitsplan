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
  XMarkIcon,
  HomeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Arbeitsplan', href: '/arbeitsplan3', icon: CalendarIcon },
  { name: 'Schichten', href: '/schichten2', icon: ClockIcon },
  { name: 'Filialen', href: '/stores', icon: BuildingOfficeIcon },
  { name: 'Mitarbeiter', href: '/employees', icon: UserGroupIcon },
  { name: 'Auswertungen', href: '/auswertungen', icon: DocumentTextIcon },
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
                      group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold mx-2 transition-all duration-200
                      ${isActive
                        ? 'bg-slate-200 text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:shadow-sm'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={`h-6 w-6 shrink-0 ${
                        isActive ? 'text-slate-700' : 'text-slate-500 group-hover:text-slate-600'
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
          className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-white shadow-md"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6 text-slate-600" aria-hidden="true" />
        </button>

        {/* Mobile menu overlay with slide animation */}
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            className={`fixed inset-y-0 left-0 w-64 bg-white transform transition-transform duration-300 ease-in-out shadow-2xl ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6">
              <h1 className="text-xl font-semibold text-slate-800">Arbeitsplan</h1>
              <button
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
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
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-100/50 px-6 shadow-xl">
          <div className="flex h-16 shrink-0 items-center border-b border-slate-200/50">
            <h1 className="text-xl font-semibold text-slate-700">Arbeitsplan</h1>
          </div>
          <NavigationLinks />
        </div>
      </div>
    </>
  );
}
