'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { localStorageService } from '@/lib/localStorageService';
import { LogType } from '@/types/log';

interface LogContextType {
  addLog: (type: LogType, message: string, details?: any) => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: React.ReactNode }) {
  const addLog = useCallback((type: LogType, message: string, details?: any) => {
    localStorageService.addLog(type, message, details);
  }, []);

  return (
    <LogContext.Provider value={{ addLog }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLog() {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLog must be used within a LogProvider');
  }
  return context;
}
