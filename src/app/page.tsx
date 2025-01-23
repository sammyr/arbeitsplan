'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  ClockIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CakeIcon,
  BeakerIcon,
  ChartPieIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import type { ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react';

interface Feature {
  name: string;
  description: string;
  href: string;
  icon: ForwardRefExoticComponent<SVGProps<SVGSVGElement> & RefAttributes<SVGSVGElement>>;
  color: string;
}

export default function HomePage() {
  const { user } = useAuth();

  const features: Feature[] = [
    {
      name: 'Dashboard',
      description: 'Übersichtliche Darstellung aller wichtigen Kennzahlen und Aktivitäten.',
      href: '/dashboard',
      icon: ChartBarIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Arbeitsplan',
      description: 'Erstellen und verwalten Sie die Arbeitspläne für alle Mitarbeiter.',
      href: '/arbeitsplan',
      icon: CalendarIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Schichten',
      description: 'Definieren und organisieren Sie verschiedene Schichtmodelle.',
      href: '/schichten',
      icon: ClockIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Filialen',
      description: 'Verwalten Sie alle Ihre Standorte und deren spezifische Einstellungen.',
      href: '/filialen',
      icon: BuildingOfficeIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Mitarbeiter',
      description: 'Mitarbeiterverwaltung mit Kontaktdaten und Verfügbarkeiten.',
      href: '/mitarbeiter',
      icon: UserGroupIcon,
      color: 'bg-red-500'
    },
    {
      name: 'Geburtstage',
      description: 'Behalten Sie den Überblick über die Geburtstage Ihrer Mitarbeiter.',
      href: '/geburtstage',
      icon: CakeIcon,
      color: 'bg-pink-500'
    },
    {
      name: 'Urlaubstage',
      description: 'Übersicht der Urlaubstage Ihrer Mitarbeiter.',
      href: '/urlaubstage',
      icon: BeakerIcon,
      color: 'bg-indigo-500'
    },
    {
      name: 'Auswertungen',
      description: 'Detaillierte Analysen und Berichte für fundierte Entscheidungen.',
      href: '/auswertungen',
      icon: ChartPieIcon,
      color: 'bg-orange-500'
    },
    {
      name: 'Logbuch',
      description: 'Protokollierung aller wichtigen Aktivitäten und Änderungen.',
      href: '/logbuch',
      icon: DocumentTextIcon,
      color: 'bg-teal-500'
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Willkommen im Dienstplan Manager
          </h1>
          <p className="text-lg text-gray-600">
            Effiziente Verwaltung von Arbeitszeiten und Schichten
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.name}
              href={feature.href}
              className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300"
            >
              <div className="flex items-center space-x-4">
                <div className={`${feature.color} rounded-lg p-3`}>
                  <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span className="group-hover:underline">Öffnen</span>
                <svg 
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Schnellzugriff</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/arbeitsplan"
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            >
              Arbeitsplan erstellen
            </Link>
            <Link
              href="/mitarbeiter"
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            >
              Mitarbeiter verwalten
            </Link>
            <Link
              href="/urlaubstage"
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            >
              Urlaube einsehen
            </Link>
            <Link
              href="/auswertungen"
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            >
              Auswertungen anzeigen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
