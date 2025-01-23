'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CakeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface SidebarProps {
  onMobileMenuClose?: () => void;
}

export default function Sidebar({ onMobileMenuClose }: { onMobileMenuClose: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { href: '/', name: 'Home', icon: HomeIcon },
    { href: '/dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { href: '/arbeitsplan', name: 'Arbeitsplan', icon: CalendarIcon },
    { href: '/arbeitsschichten', name: 'Schichten', icon: ClockIcon },
    { href: '/filialen', name: 'Filialen', icon: BuildingOfficeIcon },
    { href: '/mitarbeiter', name: 'Mitarbeiter', icon: UserGroupIcon },
    { href: '/geburtstage', name: 'Geburtstage', icon: CakeIcon },
    { href: '/urlaubstage', name: 'Urlaubstage', icon: CalendarDaysIcon },
    { href: '/auswertungen', name: 'Auswertungen', icon: DocumentTextIcon },
    { href: '/logbuch', name: 'Logbuch', icon: ClipboardDocumentListIcon },
    { href: '/einstellungen', name: 'Einstellungen', icon: CogIcon },
    { href: '/hilfe', name: 'Hilfe', icon: QuestionMarkCircleIcon },
  ];

  return (
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
                    onClick={() => onMobileMenuClose()}
                    className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <item.icon
                      className={`h-6 w-6 shrink-0 ${
                        isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'
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

        <li className="mt-auto">
          <button
            onClick={() => logout()}
            className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full"
          >
            <ArrowLeftOnRectangleIcon
              className="text-gray-400 group-hover:text-emerald-600 h-6 w-6 shrink-0"
              aria-hidden="true"
            />
            Abmelden
          </button>
        </li>
      </ul>
    </nav>
  );
}
