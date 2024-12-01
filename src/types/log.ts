export type LogType = 'info' | 'success' | 'warning' | 'error';

export interface LogEntry {
  id: string;
  type: LogType;
  message: string;
  details?: string;
  timestamp: string;
  userId?: string;
}
