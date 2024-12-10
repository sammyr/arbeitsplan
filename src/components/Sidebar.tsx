'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  BuildingOfficeIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  ClockIcon,
  CogIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  HomeIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon as CalendarDays,
  UsersIcon as Users,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface SidebarProps {
  onMobileMenuClose?: () => void;
}

const Sidebar = ({ onMobileMenuClose }: SidebarProps) => {
  const { user, userRole, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  console.log('Sidebar Debug:', {
    userExists: !!user,
    userRole,
    pathname
  });

  const adminMenuItems = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { href: '/arbeitsplan', label: 'Arbeitsplan', icon: CalendarIcon },
    { href: '/arbeitsschichten', label: 'Schichten', icon: ClockIcon },
    { href: '/filialen', label: 'Filialen', icon: BuildingOfficeIcon },
    { href: '/mitarbeiter', label: 'Mitarbeiter', icon: UserGroupIcon },
    { href: '/auswertungen', label: 'Auswertungen', icon: DocumentTextIcon },
    { href: '/logbuch', label: 'Logbuch', icon: ClipboardDocumentListIcon },
    { href: '/einstellungen', label: 'Einstellungen', icon: CogIcon },
    { href: '/hilfe', label: 'Hilfe', icon: QuestionMarkCircleIcon },
  ];

  const employeeMenuItems = [
    { href: '/arbeitsplan', label: 'Arbeitsplan', icon: CalendarIcon },
  ];

  const bottomMenuItems = [
    { href: '/import', label: 'Import', icon: ArrowUpTrayIcon },
    { href: '/profile', label: 'Profil', icon: UserCircleIcon },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

  console.log('Current user role:', userRole);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6">
      <div className="flex h-16 shrink-0 items-center">
        <Link href="/" className="flex items-center">
          <img
            className="h-8 w-auto"
            src="/logo.svg"
            alt="Arbeitsplan Logo"
          />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`
                      group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                      ${pathname === item.href
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                    onClick={onMobileMenuClose}
                  >
                    <item.icon
                      className={`h-6 w-6 shrink-0 ${
                        pathname === item.href ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'
                      }`}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto -mx-2 space-y-1">
            {bottomMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                  ${pathname === item.href
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                onClick={onMobileMenuClose}
              >
                <item.icon
                  className={`h-6 w-6 shrink-0 ${
                    pathname === item.href ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'
                  }`}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            ))}
            <button
              onClick={async () => {
                if (onMobileMenuClose) onMobileMenuClose();
                await handleLogout();
              }}
              className="flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0 text-gray-400" aria-hidden="true" />
              Ausloggen
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
