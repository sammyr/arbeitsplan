export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
}

export interface WorkingShift {
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
  extendedProps?: {
    shift: WorkingShift;
    employee: Employee;
    workingShift: WorkingShift;
  };
}
