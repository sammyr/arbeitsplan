import { LogEntry, LogType } from '@/types/log';

const LOCAL_STORAGE_KEY = 'arbeitsplan_logs';

export const localStorageService = {
  getLogs(): LogEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const storedLogs = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (error) {
      console.error('Error reading logs from localStorage:', error);
      return [];
    }
  },

  addLog(type: LogType, message: string, details?: any): void {
    if (typeof window === 'undefined') return;

    try {
      const currentLogs = this.getLogs();
      const newLog: LogEntry = {
        id: Date.now().toString(),
        type,
        message,
        details,
        createdAt: new Date().toISOString()
      };

      currentLogs.unshift(newLog); // Add to beginning of array
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentLogs));
    } catch (error) {
      console.error('Error adding log to localStorage:', error);
    }
  },

  clearLogs(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing logs from localStorage:', error);
    }
  }
};
