import type { Employee } from './employee';
export type { Employee };

export interface ShiftDefinition {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  workHours: number;
  priority?: number;
  color?: string;
  excludeFromCalculations?: boolean;
}

export interface WorkingShift {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  workHours: number;
  shiftId: string;
  storeId: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  excludeFromCalculations?: boolean;
}

export interface WorkplanEntry {
  id: string;
  date: string;
  employeeId: string;
  shiftId: string;
}

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  storeId: string;
  date: string;
  workingHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  employeeId: string;
  shiftId: string;
  storeId: string;
  extendedProps: {
    shift: WorkingShift & {
      date: string;
    };
    employee: Employee;
    workingShift: WorkingShift;
  };
}
