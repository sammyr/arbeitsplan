'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UsersIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { dbService } from '@/lib/db';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState([
    {
      name: 'Aktive Mitarbeiter',
      value: '0',
      icon: UsersIcon,
      change: '0',
      changeType: 'neutral',
      color: 'bg-blue-500',
      description: 'Mitarbeiter im aktuellen Monat',
      href: '/employees'
    },
    {
      name: 'Offene Schichten',
      value: '0',
      icon: ClockIcon,
      change: '0',
      changeType: 'neutral',
      color: 'bg-yellow-500',
      description: 'Noch nicht zugewiesene Schichten',
      href: '/shifts'
    },
    {
      name: 'Aktive Stores',
      value: '0',
      icon: BuildingOfficeIcon,
      change: '0',
      changeType: 'neutral',
      color: 'bg-green-500',
      description: 'Verwaltete Filialen',
      href: '/stores'
    },
    {
      name: 'Geplante Schichten',
      value: '0',
      icon: CalendarIcon,
      change: '0',
      changeType: 'neutral',
      color: 'bg-purple-500',
      description: 'Zugewiesene Schichten diese Woche',
      href: '/workplan'
    },
  ]);

  interface Activity {
    id: string;
    content: string;
    date: string;
    icon: any; 
    iconBackground: string;
    details?: string;
  }

  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Lade alle benötigten Daten parallel
      const [employees, stores, workingShifts, assignments, logs] = await Promise.all([
        dbService.getEmployees(),
        dbService.getStores(),
        dbService.getWorkingShifts(),
        dbService.getAssignments(),
        dbService.getLogEntries()
      ]);

      // Berechne die Anzahl der Schichten diese Woche
      const startOfThisWeek = startOfWeek(new Date(), { locale: de });
      const endOfThisWeek = endOfWeek(new Date(), { locale: de });
      const shiftsThisWeek = assignments.filter(assignment => {
        const assignmentDate = new Date(assignment.date);
        return assignmentDate >= startOfThisWeek && assignmentDate <= endOfThisWeek;
      });

      // Berechne die Änderungen im Vergleich zur Vorwoche
      const lastWeekStart = new Date(startOfThisWeek);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(endOfThisWeek);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
      
      const shiftsLastWeek = assignments.filter(assignment => {
        const assignmentDate = new Date(assignment.date);
        return assignmentDate >= lastWeekStart && assignmentDate <= lastWeekEnd;
      });

      const employeeChange = employees.length - (employees.length - 2); // Beispiel
      const shiftsChange = shiftsThisWeek.length - shiftsLastWeek.length;

      // Aktualisiere die Statistiken
      setStats([
        {
          name: 'Aktive Mitarbeiter',
          value: employees.length.toString(),
          icon: UsersIcon,
          change: employeeChange >= 0 ? `+${employeeChange}` : employeeChange.toString(),
          changeType: employeeChange > 0 ? 'increase' : employeeChange < 0 ? 'decrease' : 'neutral',
          color: 'bg-blue-500',
          description: 'Mitarbeiter im aktuellen Monat',
          href: '/employees'
        },
        {
          name: 'Offene Schichten',
          value: workingShifts.length.toString(),
          icon: ClockIcon,
          change: '0',
          changeType: 'neutral',
          color: 'bg-yellow-500',
          description: 'Verfügbare Schichten',
          href: '/schichten2'
        },
        {
          name: 'Aktive Stores',
          value: stores.length.toString(),
          icon: BuildingOfficeIcon,
          change: '0',
          changeType: 'neutral',
          color: 'bg-green-500',
          description: 'Verwaltete Filialen',
          href: '/stores'
        },
        {
          name: 'Geplante Schichten',
          value: shiftsThisWeek.length.toString(),
          icon: CalendarIcon,
          change: shiftsChange >= 0 ? `+${shiftsChange}` : shiftsChange.toString(),
          changeType: shiftsChange > 0 ? 'increase' : shiftsChange < 0 ? 'decrease' : 'neutral',
          color: 'bg-purple-500',
          description: 'Zugewiesene Schichten diese Woche',
          href: '/arbeitsplan3'
        },
      ]);

      // Konvertiere die letzten Log-Einträge in Aktivitäten
      const recentActivities = logs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
        .map(log => ({
          id: log.id,
          content: log.message,
          date: `Vor ${getTimeDifference(new Date(log.timestamp))}`,
          icon: getIconForLogType(log.type),
          iconBackground: getColorForLogType(log.type),
          details: log.details
        }));

      setActivities(recentActivities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Hilfsfunktion für die Zeitdifferenz
  const getTimeDifference = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'wenigen Sekunden';
    if (diffInMinutes < 60) return `${diffInMinutes} Minuten`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} Stunden`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} Tagen`;
  };

  // Hilfsfunktion für Log-Icons
  const getIconForLogType = (type: string) => {
    switch (type) {
      case 'success':
        return CalendarIcon;
      case 'error':
        return ClockIcon;
      case 'info':
        return UsersIcon;
      default:
        return BuildingOfficeIcon;
    }
  };

  // Hilfsfunktion für Log-Farben
  const getColorForLogType = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-4 bg-transparent">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">
          Übersicht über alle wichtigen Kennzahlen und Aktivitäten.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              onClick={() => router.push(stat.href)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center">
                <div className={`rounded-lg p-3 ${stat.color.replace('bg-blue-500', 'bg-emerald-500').replace('bg-yellow-500', 'bg-amber-500').replace('bg-green-500', 'bg-emerald-500')} bg-opacity-10`}>
                  <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-').replace('blue-500', 'emerald-500').replace('yellow-500', 'amber-500').replace('green-500', 'emerald-500')}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                    <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'increase' 
                        ? 'text-emerald-600' 
                        : stat.changeType === 'decrease' 
                        ? 'text-red-600'
                        : 'text-slate-500'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{stat.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Letzte Aktivitäten</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activity.iconBackground.replace('bg-blue-500', 'bg-emerald-500').replace('bg-yellow-500', 'bg-amber-500').replace('bg-green-500', 'bg-emerald-500')}`}>
                          <activity.icon className="h-5 w-5 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-slate-900">{activity.content}</p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-slate-500">
                          <time dateTime={activity.date}>{activity.date}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Schnellzugriff</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.name}
                  onClick={() => router.push(action.href)}
                  className="relative flex items-center space-x-3 rounded-lg border border-slate-200 px-6 py-5 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
                >
                  <div className={`flex-shrink-0 ${action.iconBackground.replace('bg-gray-400', 'bg-emerald-500')} rounded-lg p-3`}>
                    <ActionIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="focus:outline-none">
                      <p className="text-sm font-medium text-slate-900">{action.name}</p>
                      <p className="text-sm text-slate-500">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div> */}
      </div>
    </div>
  );
}
