'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UsersIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const router = useRouter();
  
  // Example stats - these should be fetched from your backend in a real application
  const stats = [
    {
      name: 'Aktive Mitarbeiter',
      value: '12',
      icon: UsersIcon,
      change: '+2',
      changeType: 'increase',
      color: 'bg-blue-500',
      description: 'Mitarbeiter im aktuellen Monat',
      href: '/employees'
    },
    {
      name: 'Offene Schichten',
      value: '8',
      icon: ClockIcon,
      change: '-3',
      changeType: 'decrease',
      color: 'bg-yellow-500',
      description: 'Noch nicht zugewiesene Schichten',
      href: '/shifts'
    },
    {
      name: 'Aktive Stores',
      value: '3',
      icon: BuildingOfficeIcon,
      change: '0',
      changeType: 'neutral',
      color: 'bg-green-500',
      description: 'Verwaltete Filialen',
      href: '/stores'
    },
    {
      name: 'Geplante Schichten',
      value: '24',
      icon: CalendarIcon,
      change: '+5',
      changeType: 'increase',
      color: 'bg-purple-500',
      description: 'Zugewiesene Schichten diese Woche',
      href: '/workplan'
    },
  ];

  const activities = [
    {
      id: 1,
      content: 'Neue Schicht wurde erstellt für Store Mitte',
      date: 'Vor 5 Minuten',
      icon: CalendarIcon,
      iconBackground: 'bg-blue-500'
    },
    {
      id: 2,
      content: 'Mitarbeiter Max Mustermann wurde hinzugefügt',
      date: 'Vor 2 Stunden',
      icon: UsersIcon,
      iconBackground: 'bg-green-500'
    },
    {
      id: 3,
      content: 'Arbeitsplan für nächste Woche wurde aktualisiert',
      date: 'Vor 4 Stunden',
      icon: ClockIcon,
      iconBackground: 'bg-yellow-500'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <span className="text-gray-500">{new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        
        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => router.push(stat.href)}
            >
              <div className={`absolute top-0 right-0 w-3 h-full ${stat.color}`} />
              <div className="flex items-center">
                <div className={`rounded-lg ${stat.color} p-3`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'increase'
                        ? 'text-green-600'
                        : stat.changeType === 'decrease'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{stat.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Letzte Aktivitäten</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {activities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== activities.length - 1 ? (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex items-center space-x-3 px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                        <div>
                          <span
                            className={`${activity.iconBackground} flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white`}
                          >
                            <activity.icon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.content}</p>
                          <p className="text-sm text-gray-500">{activity.date}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
