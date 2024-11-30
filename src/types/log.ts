export interface LogEntry {
    id: string;
    action: string;
    details: string;
    timestamp: string;
    userId?: string;
}
