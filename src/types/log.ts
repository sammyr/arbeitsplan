export type LogType = 'info' | 'success' | 'warning' | 'error';

export interface LogEntry {
  id: string;
  type: LogType;
  message: string;
  details?: any;
  createdAt: string | Date;
  userId?: string;
}
