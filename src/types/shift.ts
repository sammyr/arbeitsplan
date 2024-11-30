export interface Shift {
  id: string;
  title: string;
  workHours: number;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftId: string;
  storeId: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftFormData {
  employeeId: string;
  shiftType: 'morning' | 'afternoon' | 'night';
}
