'use client';

import React, { useEffect, useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { dbService } from '@/lib/db';
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
  
  const colors = LogTypeColors[type];
  const Icon = LogTypeIcons[type];

  let formattedTime = '-';
  try {
    const date = parseISO(entry.createdAt as string);
    formattedTime = format(date, 'HH:mm', { locale: de });
  } catch (error) {
    console.error('Error formatting time:', error);
  }

  return (
    <div className={`py-2 ${colors.bg}`}>
      <div className="flex items-start px-4">
        <div className="flex-shrink-0 pt-1">
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${colors.text}`}>
              {entry.message}
            </p>
            <span className={`ml-2 text-sm ${colors.text} opacity-75`}>
              {formattedTime}
            </span>
          </div>
          {entry.details && (
            <pre className={`mt-1 whitespace-pre-wrap text-sm ${colors.text} opacity-90`}>
              {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details, null, 2)}
            </pre>
          )}
        </div>
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
      const logs = await dbService.getLogEntries();
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
      await dbService.clearLogs();
      await dbService.addLogEntry('info', 'Logbuch gelöscht', 'Alle Logbuch-Einträge wurden gelöscht');
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
      } catch (error) {
        console.error('Error processing log entry:', error, log);
      }
      return groups;
    }, {});
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-slate-600">Lade Logbuch-Einträge...</div>
        </div>
      </div>
    );
  }

  const groupedLogs = groupLogsByDate(logEntries);
  const dates = Object.keys(groupedLogs).sort().reverse();

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Logbuch</h1>
            <p className="text-slate-600">
              Übersicht aller Systemaktivitäten und Änderungen.
            </p>
          </div>
          {logEntries.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors duration-200"
            >
              Logbuch löschen
            </button>
          )}
        </div>
      </div>
      
      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {dates.length > 0 ? (
            dates.map(date => {
              const formattedDate = format(parseISO(date), 'EEEE, d. MMMM yyyy', { locale: de });
              return (
                <div key={date} className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    {formattedDate}
                  </h2>
                  <div className="bg-white rounded-lg shadow-sm divide-y divide-slate-100">
                    {groupedLogs[date].map(entry => (
                      <LogEntryRow key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500">
              Keine Logbuch-Einträge vorhanden
            </div>
          )}
        </div>
      )}
    </div>
  );
}
