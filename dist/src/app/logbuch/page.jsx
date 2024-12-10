"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LogbuchPage;
const react_1 = __importStar(require("react"));
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const db_1 = require("@/lib/db");
const outline_1 = require("@heroicons/react/24/outline");
const LogTypeIcons = {
    success: outline_1.CheckCircleIcon,
    warning: outline_1.ExclamationCircleIcon,
    error: outline_1.XCircleIcon,
    info: outline_1.InformationCircleIcon,
};
const LogTypeColors = {
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
const LogEntryRow = ({ entry }) => {
    const type = Object.keys(LogTypeColors).includes(entry.type)
        ? entry.type
        : 'info';
    const colors = LogTypeColors[type];
    const Icon = LogTypeIcons[type];
    let formattedTime = '-';
    try {
        formattedTime = (0, date_fns_1.format)(new Date(entry.timestamp), 'HH:mm', { locale: locale_1.de });
    }
    catch (error) {
        console.error('Error formatting time:', error);
    }
    return (<div className={`py-2 ${colors.bg}`}>
      <div className="flex items-start px-4">
        <div className="flex-shrink-0 pt-1">
          <Icon className={`h-5 w-5 ${colors.icon}`}/>
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
          {entry.details && (<pre className={`mt-1 whitespace-pre-wrap text-sm ${colors.text} opacity-90`}>
              {entry.details}
            </pre>)}
        </div>
      </div>
    </div>);
};
function LogbuchPage() {
    const [logEntries, setLogEntries] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const logs = await db_1.dbService.getLogEntries();
            const validatedLogs = logs.map(log => (Object.assign(Object.assign({}, log), { type: Object.keys(LogTypeColors).includes(log.type) ? log.type : 'info' })));
            setLogEntries(validatedLogs);
        }
        catch (error) {
            console.error('Error fetching log entries:', error);
            setError('Fehler beim Laden der Logbuch-Einträge');
            setLogEntries([]);
        }
        finally {
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
            await db_1.dbService.clearLogs();
            await db_1.dbService.addLogEntry('info', 'Logbuch gelöscht', 'Alle Logbuch-Einträge wurden gelöscht');
            await fetchLogs();
        }
        catch (error) {
            console.error('Error clearing logs:', error);
            setError('Fehler beim Löschen der Logbuch-Einträge');
        }
        finally {
            setIsLoading(false);
        }
    };
    const groupLogsByDate = (logs) => {
        return logs.reduce((groups, log) => {
            const date = (0, date_fns_1.format)((0, date_fns_1.parseISO)(log.timestamp), 'yyyy-MM-dd');
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(log);
            return groups;
        }, {});
    };
    (0, react_1.useEffect)(() => {
        fetchLogs();
    }, []);
    if (isLoading) {
        return (<div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-slate-600">Lade Logbuch-Einträge...</div>
        </div>
      </div>);
    }
    const groupedLogs = groupLogsByDate(logEntries);
    const dates = Object.keys(groupedLogs).sort().reverse();
    return (<div className="container mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Logbuch</h1>
            <p className="text-slate-600">
              Übersicht aller Systemaktivitäten und Änderungen.
            </p>
          </div>
          {logEntries.length > 0 && (<button onClick={handleClearLogs} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors duration-200">
              Logbuch löschen
            </button>)}
        </div>
      </div>
      
      {error ? (<div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700">
          {error}
        </div>) : (<div className="space-y-6">
          {dates.length > 0 ? (dates.map(date => {
                const formattedDate = (0, date_fns_1.format)((0, date_fns_1.parseISO)(date), 'EEEE, d. MMMM yyyy', { locale: locale_1.de });
                return (<div key={date} className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    {formattedDate}
                  </h2>
                  <div className="bg-white rounded-lg shadow-sm divide-y divide-slate-100">
                    {groupedLogs[date].map(entry => (<LogEntryRow key={entry.id} entry={entry}/>))}
                  </div>
                </div>);
            })) : (<div className="text-center py-8 text-slate-500">
              Keine Logbuch-Einträge vorhanden
            </div>)}
        </div>)}
    </div>);
}
