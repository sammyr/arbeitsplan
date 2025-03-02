'use client';

import React, { useEffect, useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { localStorageService } from '@/lib/localStorageService';
import { LogEntry, LogType } from '@/types/log';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';

const LogTypeIcons: Record<LogType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircleIcon,
  warning: ExclamationCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
};

const LogTypeColors: Record<LogType, { bg: string; text: string; icon: string }> = {
  success: { 
    bg: 'bg-green-50', 
    text: 'text-green-700', 
    icon: 'text-green-400',
  },
  warning: { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    icon: 'text-amber-400',
  },
  error: { 
    bg: 'bg-rose-50', 
    text: 'text-rose-700', 
    icon: 'text-rose-400',
  },
  info: { 
    bg: 'bg-slate-50', 
    text: 'text-slate-700', 
    icon: 'text-slate-400',
  },
};

interface LogEntryRowProps {
  entry: LogEntry;
}

const LogEntryRow: React.FC<LogEntryRowProps> = ({ entry }) => {
  const type: LogType = Object.keys(LogTypeColors).includes(entry.type) 
    ? entry.type as LogType 
    : 'info';

  const Icon = LogTypeIcons[type];
  const colors = LogTypeColors[type];

  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg ${colors.bg}`}>
      <Icon className={`w-5 h-5 mt-0.5 ${colors.icon}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${colors.text}`}>
          {entry.message}
        </p>
        {entry.details && (
          <p className={`mt-1 text-sm ${colors.text} opacity-90`}>
            {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)}
          </p>
        )}
        <p className={`mt-1 text-xs ${colors.text} opacity-75`}>
          {format(typeof entry.createdAt === 'string' ? parseISO(entry.createdAt) : entry.createdAt, 'HH:mm')}
        </p>
      </div>
    </div>
  );
};

interface GroupedLogs {
  [date: string]: LogEntry[];
}

export default function LogbuchPage() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const logs = localStorageService.getLogs();
      const validatedLogs = logs.map(log => ({
        ...log,
        type: Object.keys(LogTypeColors).includes(log.type) ? log.type : 'info'
      }));
      setLogEntries(validatedLogs);
    } catch (error) {
      console.error('Error fetching log entries:', error);
      setError('Fehler beim Laden der Logbuch-Einträge');
      setLogEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Möchten Sie wirklich alle Logbuch-Einträge löschen?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      localStorageService.clearLogs();
      localStorageService.addLog('info', 'Logbuch gelöscht', 'Alle Logbuch-Einträge wurden gelöscht');
      await fetchLogs();
    } catch (error) {
      console.error('Error clearing logs:', error);
      setError('Fehler beim Löschen der Logbuch-Einträge');
    } finally {
      setIsLoading(false);
    }
  };

  const groupLogsByDate = (logs: LogEntry[]): GroupedLogs => {
    return logs.reduce((groups: GroupedLogs, log) => {
      try {
        const date = format(parseISO(log.createdAt as string), 'yyyy-MM-dd');
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(log);
        return groups;
      } catch (error) {
        console.error('Error grouping log:', error);
        return groups;
      }
    }, {});
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const groupedLogs = groupLogsByDate(logEntries);
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Ladeanimation entfernt, Container beibehalten */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">Logbuch</h1>
        <button
          onClick={handleClearLogs}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Logbuch leeren
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-lg bg-rose-50 text-rose-700">
          {error}
        </div>
      )}

      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">Keine Logbuch-Einträge vorhanden.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date}>
              <h2 className="mb-4 text-sm font-medium text-slate-500">
                {format(parseISO(date), 'EEEE, d. MMMM yyyy', { locale: de })}
              </h2>
              <div className="space-y-2">
                {groupedLogs[date].map(entry => (
                  <LogEntryRow key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
