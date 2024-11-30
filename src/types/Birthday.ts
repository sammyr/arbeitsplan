export interface Birthday {
  id: string;
  name: string;
  date: string;
  reminderDays: number;
  lastEmailYear?: number;
  email?: string;
  interests?: string;
  notes?: string;
  active: boolean;
}
