import { Shift } from './shift';
import { Employee } from './employee';
import { WorkingShift } from './index';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  employeeId: string;
  shiftId: string;
  storeId: string;
  extendedProps: {
    shift: Shift & {
      date: string;
    };
    employee: Employee;
    workingShift: WorkingShift;
  };
}
