import Link from 'next/link';
import { MdCalendarMonth, MdPeople, MdAccessTime, MdSettings, MdBarChart } from 'react-icons/md';

export const metadata = {
  title: 'Arbeitsplan - Effiziente Mitarbeiterplanung',
  description: 'Verwalten Sie Ihre Mitarbeiterpläne einfach und effizient mit unserem interaktiven Arbeitsplan-System.',
};

const features = [
  {
    name: 'Dashboard',
    description: 'Überblick über wichtige Kennzahlen und aktuelle Aktivitäten.',
    icon: MdBarChart,
    href: '/dashboard',
  },
  {
    name: 'Arbeitsplan-Kalender',
    description: 'Anzeigen und Verwalten von Mitarbeiterplänen in einem interaktiven Kalender.',
    icon: MdCalendarMonth,
    href: '/workplan',
  },
  {
    name: 'Mitarbeiterverwaltung',
    description: 'Hinzufügen, Bearbeiten und Verwalten von Mitarbeiterinformationen.',
    icon: MdPeople,
    href: '/employees',
  },
  {
    name: 'Arbeitszeiten',
    description: 'Konfigurieren und Verwalten von Arbeitszeitplänen.',
    icon: MdAccessTime,
    href: '/shifts',
  },
  {
    name: 'Einstellungen',
    description: 'Konfigurieren Sie E-Mail-Benachrichtigungen und andere Systemeinstellungen.',
    icon: MdSettings,
    href: '/settings',
  },
];

export default function Home() {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="mx-auto max-w-4xl py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Willkommen beim Arbeitsplan-Manager
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Verwalten Sie effizient die Arbeitszeitpläne und Mitarbeiterinformationen
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center">
                    <feature.icon className="h-10 w-10 text-blue-500" />
                    <h2 className="ml-3 text-xl font-semibold text-gray-900">{feature.name}</h2>
                  </div>
                  <p className="mt-4 text-gray-600">{feature.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
